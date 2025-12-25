import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  MenuItem,
  Button,
} from '@mui/material';
import apiClient from '../api/client';
import { OnboardingRequest, ApiResponse, PaginatedResponse } from '../types';

const Dashboard: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  const { data: requestsData, isLoading } = useQuery<PaginatedResponse<OnboardingRequest>>({
    queryKey: ['onboarding', statusFilter, searchTerm],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await apiClient.get('/onboarding', { params });
      return response.data;
    },
  });

  const { data: statsData } = useQuery<ApiResponse<any>>({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await apiClient.get('/onboarding/stats');
      return response.data;
    },
  });

  const requests = requestsData?.data || [];
  const stats = statsData?.data || {};

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Onboarding Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4">
                {stats.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4">
                {stats.byStatus?.['In Progress'] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4">
                {stats.byStatus?.['Completed'] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Under Review
              </Typography>
              <Typography variant="h4">
                {stats.byStatus?.['Under Review'] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Status"
            select
            variant="outlined"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="New">New</MenuItem>
            <MenuItem value="Under Review">Under Review</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="On Hold">On Hold</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference</TableCell>
              <TableCell>Trading Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>{request.referenceNumber}</TableCell>
                  <TableCell>{request.tradingName}</TableCell>
                  <TableCell>{request.contactEmail}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{request.assignedTeam || 'Unassigned'}</TableCell>
                  <TableCell>
                    <LinearProgress
                      variant="determinate"
                      value={request.completionPercentage}
                      sx={{ minWidth: 100 }}
                    />
                    <Typography variant="caption">
                      {request.completionPercentage}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => navigate(`/request/${request.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Dashboard;

