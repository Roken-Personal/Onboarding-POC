export interface OnboardingRequest {
  id: string;
  tradingName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyAddress?: string;
  industry?: string;
  companySize?: string;
  requestType?: string;
  region?: string;
  status: 'New' | 'Under Review' | 'In Progress' | 'Completed' | 'On Hold';
  assignedTeam?: string;
  assignedUserId?: string;
  completionPercentage: number;
  referenceNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  statusHistory?: StatusHistory[];
  teamAssignments?: TeamAssignment[];
}

export interface StatusHistory {
  id: string;
  requestId: string;
  oldStatus?: string;
  newStatus?: string;
  changedBy?: string;
  changedAt: string;
  notes?: string;
}

export interface TeamAssignment {
  id: string;
  requestId: string;
  teamName: string;
  assignedUserId?: string;
  assignedAt: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

