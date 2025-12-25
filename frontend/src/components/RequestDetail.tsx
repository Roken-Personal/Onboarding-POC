import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import apiClient from '../api/client';
import { OnboardingRequest, ApiResponse } from '../types';

const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<ApiResponse<OnboardingRequest>>({
    queryKey: ['onboarding', id],
    queryFn: async () => {
      const response = await apiClient.get(`/onboarding/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const request = data?.data;

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      'New': 'info',
      'Under Review': 'warning',
      'In Progress': 'primary',
      'Completed': 'success',
      'On Hold': 'error',
    };
    return colors[status] || 'default';
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  if (error || !request) {
    return (
      <Alert severity="error">
        Failed to load request details
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">
          Request Details
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                {request.tradingName}
              </Typography>
              <Chip
                label={request.status}
                color={getStatusColor(request.status)}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Reference: {request.referenceNumber}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Contact Information
            </Typography>
            <Typography variant="body1"><strong>Name:</strong> {request.contactName}</Typography>
            <Typography variant="body1"><strong>Email:</strong> {request.contactEmail}</Typography>
            {request.contactPhone && (
              <Typography variant="body1"><strong>Phone:</strong> {request.contactPhone}</Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Business Details
            </Typography>
            {request.industry && (
              <Typography variant="body1"><strong>Industry:</strong> {request.industry}</Typography>
            )}
            {request.companySize && (
              <Typography variant="body1"><strong>Company Size:</strong> {request.companySize}</Typography>
            )}
            {request.requestType && (
              <Typography variant="body1"><strong>Request Type:</strong> {request.requestType}</Typography>
            )}
            {request.region && (
              <Typography variant="body1"><strong>Region:</strong> {request.region}</Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Assignment
            </Typography>
            <Typography variant="body1">
              <strong>Team:</strong> {request.assignedTeam || 'Unassigned'}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progress: {request.completionPercentage}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={request.completionPercentage}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Timeline
            </Typography>
            <Typography variant="body1">
              <strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="body1">
              <strong>Updated:</strong> {new Date(request.updatedAt).toLocaleString()}
            </Typography>
          </Grid>

          {request.companyAddress && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Company Address
              </Typography>
              <Typography variant="body1">{request.companyAddress}</Typography>
            </Grid>
          )}

          {request.notes && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notes
              </Typography>
              <Typography variant="body1">{request.notes}</Typography>
            </Grid>
          )}

          {request.statusHistory && request.statusHistory.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status History
              </Typography>
              {request.statusHistory.map((history) => (
                <Box key={history.id} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {history.oldStatus || 'N/A'} → {history.newStatus || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(history.changedAt).toLocaleString()} by {history.changedBy || 'System'}
                  </Typography>
                </Box>
              ))}
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default RequestDetail;

