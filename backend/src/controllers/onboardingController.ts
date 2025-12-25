import { Request, Response } from 'express';
import { prisma } from '../db/client';
import { z } from 'zod';

// Validation schemas
const createRequestSchema = z.object({
  tradingName: z.string().min(1, 'Trading name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  industry: z.enum(['Manufacturing', 'Retail', 'Logistics', 'Other']).optional(),
  companySize: z.enum(['Small', 'Medium', 'Large', 'Enterprise']).optional(),
  requestType: z.enum(['New Installation', 'Upgrade', 'Migration']).optional(),
  region: z.enum(['North', 'South', 'East', 'West', 'International']).optional(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['New', 'Under Review', 'In Progress', 'Completed', 'On Hold']),
  notes: z.string().optional(),
});

// Generate reference number
function generateReferenceNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ONB-${dateStr}-${random}`;
}

// Create new onboarding request
export const createRequest = async (req: Request, res: Response) => {
  try {
    const validatedData = createRequestSchema.parse(req.body);
    
    const referenceNumber = generateReferenceNumber();
    
    const request = await prisma.onboardingRequest.create({
      data: {
        ...validatedData,
        referenceNumber,
        status: 'New',
        completionPercentage: 0,
      },
    });

    // Trigger routing logic (async - don't wait)
    routeRequest(request.id).catch(console.error);

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create onboarding request',
    });
  }
};

// Get all requests with filters
export const getRequests = async (req: Request, res: Response) => {
  try {
    const { status, assignedTeam, search, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (status) where.status = status;
    if (assignedTeam) where.assignedTeam = assignedTeam;
    if (search) {
      where.OR = [
        { tradingName: { contains: search as string, mode: 'insensitive' } },
        { contactName: { contains: search as string, mode: 'insensitive' } },
        { contactEmail: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.onboardingRequest.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.onboardingRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requests',
    });
  }
};

// Get single request by ID
export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const request = await prisma.onboardingRequest.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
        teamAssignments: {
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch request',
    });
  }
};

// Update request
export const updateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = createRequestSchema.partial().parse(req.body);

    const request = await prisma.onboardingRequest.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Error updating request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update request',
    });
  }
};

// Update status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateStatusSchema.parse(req.body);

    const existingRequest = await prisma.onboardingRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    // Update status
    const request = await prisma.onboardingRequest.update({
      where: { id },
      data: {
        status: validatedData.status,
        completionPercentage: getCompletionPercentage(validatedData.status),
      },
    });

    // Log status change
    await prisma.statusHistory.create({
      data: {
        requestId: id,
        oldStatus: existingRequest.status,
        newStatus: validatedData.status,
        changedBy: req.headers['x-user-id'] as string || 'system',
        notes: validatedData.notes,
      },
    });

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
    });
  }
};

// Get statistics
export const getStats = async (req: Request, res: Response) => {
  try {
    const [total, byStatus, byTeam] = await Promise.all([
      prisma.onboardingRequest.count(),
      prisma.onboardingRequest.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.onboardingRequest.groupBy({
        by: ['assignedTeam'],
        _count: true,
        where: {
          assignedTeam: { not: null },
        },
      }),
    ]);

    const stats = {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byTeam: byTeam.reduce((acc, item) => {
        acc[item.assignedTeam || 'Unassigned'] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
};

// Helper functions
function getCompletionPercentage(status: string): number {
  const statusMap: Record<string, number> = {
    'New': 0,
    'Under Review': 25,
    'In Progress': 50,
    'Completed': 100,
    'On Hold': 25,
  };
  return statusMap[status] || 0;
}

// Simple routing logic (can be enhanced later)
async function routeRequest(requestId: string) {
  try {
    const request = await prisma.onboardingRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) return;

    let assignedTeam = 'Sales'; // Default

    // Simple routing rules (can be moved to database later)
    if (request.region === 'International') {
      assignedTeam = 'Sales';
    } else if (request.requestType === 'Upgrade') {
      assignedTeam = 'Technical';
    } else if (request.companySize === 'Enterprise') {
      assignedTeam = 'Accounts';
    }

    await prisma.onboardingRequest.update({
      where: { id: requestId },
      data: {
        assignedTeam,
        status: 'Under Review',
        completionPercentage: 25,
      },
    });

    // Create team assignment record
    await prisma.teamAssignment.create({
      data: {
        requestId,
        teamName: assignedTeam,
        status: 'Pending',
      },
    });
  } catch (error) {
    console.error('Error routing request:', error);
  }
}

