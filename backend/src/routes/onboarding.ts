import { Router } from 'express';
import { 
  createRequest, 
  getRequests, 
  getRequestById, 
  updateRequest, 
  updateStatus,
  getStats 
} from '../controllers/onboardingController';

export const onboardingRoutes = Router();

// Create new onboarding request
onboardingRoutes.post('/', createRequest);

// Get all requests (with optional filters)
onboardingRoutes.get('/', getRequests);

// Get statistics
onboardingRoutes.get('/stats', getStats);

// Get single request by ID
onboardingRoutes.get('/:id', getRequestById);

// Update request
onboardingRoutes.put('/:id', updateRequest);

// Update status only
onboardingRoutes.patch('/:id/status', updateStatus);

