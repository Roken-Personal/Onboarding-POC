import { createResource, Show, For } from 'solid-js';
import { useParams } from '@solidjs/router';
import apiClient, { getCached } from '../api/client';
import type { OnboardingRequest, ApiResponse } from '../types';

export default function RequestDetail() {
  const params = useParams();

  const fetchRequest = async () => {
    const cacheKey = `/api/onboarding/${params.id}`;
    return getCached(cacheKey, async () => {
      const response = await apiClient.get<ApiResponse<OnboardingRequest>>(
        `/api/onboarding/${params.id}`
      );
      return response.data;
    });
  };

  const [requestData] = createResource(fetchRequest);

  return (
    <Show
      when={requestData()}
      fallback={<div class="text-center py-8">Loading...</div>}
    >
      {(request) => (
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-3xl font-bold mb-2">
                {request().data.tradingName}
              </h1>
              <p class="text-gray-600">Reference: {request().data.referenceNumber}</p>
            </div>
            <span
              class={`px-3 py-1 rounded-full text-sm font-semibold ${
                request().data.status === 'Completed'
                  ? 'bg-green-100 text-green-800'
                  : request().data.status === 'In Progress'
                  ? 'bg-purple-100 text-purple-800'
                  : request().data.status === 'Under Review'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {request().data.status}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 class="text-xl font-semibold mb-4">Company Information</h2>
              <dl class="space-y-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Trading Name</dt>
                  <dd class="text-sm text-gray-900">{request().data.tradingName}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Industry</dt>
                  <dd class="text-sm text-gray-900">
                    {request().data.industry || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Company Size</dt>
                  <dd class="text-sm text-gray-900">
                    {request().data.companySize || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Address</dt>
                  <dd class="text-sm text-gray-900">
                    {request().data.companyAddress || 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 class="text-xl font-semibold mb-4">Contact Information</h2>
              <dl class="space-y-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Contact Name</dt>
                  <dd class="text-sm text-gray-900">{request().data.contactName}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="text-sm text-gray-900">{request().data.contactEmail}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Phone</dt>
                  <dd class="text-sm text-gray-900">
                    {request().data.contactPhone || 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 class="text-xl font-semibold mb-4">Request Details</h2>
              <dl class="space-y-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Request Type</dt>
                  <dd class="text-sm text-gray-900">
                    {request().data.requestType || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Region</dt>
                  <dd class="text-sm text-gray-900">
                    {request().data.region || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Assigned Team</dt>
                  <dd class="text-sm text-gray-900">
                    {request().data.assignedTeam || 'Unassigned'}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Progress</dt>
                  <dd class="text-sm text-gray-900">
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        class="bg-blue-600 h-2 rounded-full"
                        style={`width: ${request().data.completionPercentage}%`}
                      />
                    </div>
                    {request().data.completionPercentage}%
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 class="text-xl font-semibold mb-4">Timeline</h2>
              <dl class="space-y-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Created</dt>
                  <dd class="text-sm text-gray-900">
                    {new Date(request().data.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd class="text-sm text-gray-900">
                    {new Date(request().data.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {request().data.notes && (
            <div class="mt-6">
              <h2 class="text-xl font-semibold mb-2">Notes</h2>
              <p class="text-gray-700 bg-gray-50 p-4 rounded">
                {request().data.notes}
              </p>
            </div>
          )}

          {request().data.statusHistory && request().data.statusHistory.length > 0 && (
            <div class="mt-6">
              <h2 class="text-xl font-semibold mb-4">Status History</h2>
              <div class="space-y-2">
                <For each={request().data.statusHistory}>
                  {(history) => (
                    <div class="border-l-4 border-blue-500 pl-4 py-2">
                      <p class="text-sm font-medium">
                        {history.oldStatus || 'New'} → {history.newStatus}
                      </p>
                      <p class="text-xs text-gray-500">
                        {new Date(history.changedAt).toLocaleString()}
                      </p>
                      {history.notes && (
                        <p class="text-sm text-gray-600 mt-1">{history.notes}</p>
                      )}
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </div>
      )}
    </Show>
  );
}

