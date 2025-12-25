import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  MenuItem,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { OnboardingRequest } from '../types';

const schema = yup.object({
  tradingName: yup.string().required('Trading name is required'),
  contactName: yup.string().required('Contact name is required'),
  contactEmail: yup.string().email('Valid email is required').required('Email is required'),
  contactPhone: yup.string(),
  companyAddress: yup.string(),
  industry: yup.string(),
  companySize: yup.string(),
  requestType: yup.string(),
  region: yup.string(),
  notes: yup.string(),
});

type FormData = yup.InferType<typeof schema>;

const steps = ['Company Information', 'Business Details', 'Additional Information'];

const OnboardingForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<OnboardingRequest | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const requestType = watch('requestType');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ success: boolean; data: OnboardingRequest }>('/onboarding', data);
      
      if (response.data.success) {
        setSuccess(response.data.data);
        setTimeout(() => {
          navigate(`/request/${response.data.data.id}`);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  if (success) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Request submitted successfully!
        </Alert>
        <Typography variant="h5" gutterBottom>
          Reference Number: {success.referenceNumber}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Redirecting to request details...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        New Onboarding Request
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <LinearProgress variant="determinate" value={((activeStep + 1) / steps.length) * 100} sx={{ mb: 4 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Trading Name"
              {...register('tradingName')}
              error={!!errors.tradingName}
              helperText={errors.tradingName?.message}
              fullWidth
              required
            />
            <TextField
              label="Contact Name"
              {...register('contactName')}
              error={!!errors.contactName}
              helperText={errors.contactName?.message}
              fullWidth
              required
            />
            <TextField
              label="Contact Email"
              type="email"
              {...register('contactEmail')}
              error={!!errors.contactEmail}
              helperText={errors.contactEmail?.message}
              fullWidth
              required
            />
            <TextField
              label="Contact Phone"
              {...register('contactPhone')}
              error={!!errors.contactPhone}
              helperText={errors.contactPhone?.message}
              fullWidth
            />
            <TextField
              label="Company Address"
              {...register('companyAddress')}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Industry"
              select
              {...register('industry')}
              fullWidth
            >
              <MenuItem value="Manufacturing">Manufacturing</MenuItem>
              <MenuItem value="Retail">Retail</MenuItem>
              <MenuItem value="Logistics">Logistics</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Company Size"
              select
              {...register('companySize')}
              fullWidth
            >
              <MenuItem value="Small">Small</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Large">Large</MenuItem>
              <MenuItem value="Enterprise">Enterprise</MenuItem>
            </TextField>
            <TextField
              label="Request Type"
              select
              {...register('requestType')}
              fullWidth
            >
              <MenuItem value="New Installation">New Installation</MenuItem>
              <MenuItem value="Upgrade">Upgrade</MenuItem>
              <MenuItem value="Migration">Migration</MenuItem>
            </TextField>
            <TextField
              label="Region"
              select
              {...register('region')}
              fullWidth
            >
              <MenuItem value="North">North</MenuItem>
              <MenuItem value="South">South</MenuItem>
              <MenuItem value="East">East</MenuItem>
              <MenuItem value="West">West</MenuItem>
              <MenuItem value="International">International</MenuItem>
            </TextField>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Notes"
              {...register('notes')}
              multiline
              rows={4}
              fullWidth
            />
            {requestType === 'Upgrade' && (
              <TextField
                label="Current Version (if applicable)"
                fullWidth
                helperText="Additional field for upgrade requests"
              />
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default OnboardingForm;

