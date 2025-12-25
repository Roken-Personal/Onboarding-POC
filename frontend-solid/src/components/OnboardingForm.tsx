import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import apiClient from '../api/client';
import type { OnboardingRequest, ApiResponse } from '../types';

interface FormData {
  tradingName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyAddress: string;
  industry: string;
  companySize: string;
  requestType: string;
  region: string;
  notes: string;
}

export default function OnboardingForm() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = createSignal(0);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<OnboardingRequest | null>(null);

  const [formData, setFormData] = createSignal<FormData>({
    tradingName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyAddress: '',
    industry: '',
    companySize: '',
    requestType: '',
    region: '',
    notes: '',
  });

  const steps = ['Company Information', 'Business Details', 'Additional Information'];

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData(), [field]: value });
  };

  const validateStep = (step: number): boolean => {
    const data = formData();
    if (step === 0) {
      if (!data.tradingName || !data.contactName || !data.contactEmail) {
        setError('Please fill in all required fields');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep())) {
      setActiveStep(activeStep() + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep() - 1);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!validateStep(activeStep())) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<ApiResponse<OnboardingRequest>>(
        '/api/onboarding',
        formData()
      );

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

  return (
    <Show
      when={!success()}
      fallback={
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
            Request submitted successfully!
          </div>
          <h2 class="text-2xl font-bold mb-2">
            Reference Number: {success()?.referenceNumber}
          </h2>
          <p class="text-gray-600">Redirecting to request details...</p>
        </div>
      }
    >
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-3xl font-bold mb-6">New Onboarding Request</h1>

        {/* Stepper */}
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div class="flex items-center flex-1">
                <div
                  class={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= activeStep()
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  class={`ml-2 text-sm ${
                    index <= activeStep() ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div
                    class={`flex-1 h-0.5 mx-4 ${
                      index < activeStep() ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={`width: ${((activeStep() + 1) / steps.length) * 100}%`}
            />
          </div>
        </div>

        <Show when={error()}>
          <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error()}
          </div>
        </Show>

        <form onSubmit={handleSubmit}>
          <Show when={activeStep() === 0}>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Trading Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData().tradingName}
                  onInput={(e) => updateField('tradingName', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData().contactName}
                  onInput={(e) => updateField('contactName', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData().contactEmail}
                  onInput={(e) => updateField('contactEmail', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData().contactPhone}
                  onInput={(e) => updateField('contactPhone', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Company Address
                </label>
                <textarea
                  rows={3}
                  value={formData().companyAddress}
                  onInput={(e) => updateField('companyAddress', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Show>

          <Show when={activeStep() === 1}>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={formData().industry}
                  onChange={(e) => updateField('industry', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <select
                  value={formData().companySize}
                  onChange={(e) => updateField('companySize', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Size</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Request Type
                </label>
                <select
                  value={formData().requestType}
                  onChange={(e) => updateField('requestType', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="New Installation">New Installation</option>
                  <option value="Upgrade">Upgrade</option>
                  <option value="Migration">Migration</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <select
                  value={formData().region}
                  onChange={(e) => updateField('region', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Region</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="International">International</option>
                </select>
              </div>
            </div>
          </Show>

          <Show when={activeStep() === 2}>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={4}
                  value={formData().notes}
                  onInput={(e) => updateField('notes', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information..."
                />
              </div>
            </div>
          </Show>

          <div class="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={activeStep() === 0}
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <Show
              when={activeStep() < steps.length - 1}
              fallback={
                <button
                  type="submit"
                  disabled={loading()}
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading() ? 'Submitting...' : 'Submit'}
                </button>
              }
            >
              <button
                type="button"
                onClick={handleNext}
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            </Show>
          </div>
        </form>
      </div>
    </Show>
  );
}

