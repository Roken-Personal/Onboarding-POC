import { createSignal, createResource, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import apiClient from '../api/client';
import type { OnboardingRequest, ApiResponse, PaginatedResponse } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = createSignal<string>('');
  const [searchTerm, setSearchTerm] = createSignal<string>('');

  const fetchRequests = async () => {
    const params: any = {};
    if (statusFilter()) params.status = statusFilter();
    if (searchTerm()) params.search = searchTerm();

    const response = await apiClient.get<PaginatedResponse<OnboardingRequest>>(
      '/api/onboarding',
      { params }
    );
    return response.data;
  };

  const fetchStats = async () => {
    const response = await apiClient.get<ApiResponse<any>>('/api/onboarding/stats');
    return response.data;
  };

  const [requestsData] = createResource(fetchRequests);
  const [statsData] = createResource(fetchStats);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-green-100 text-green-800',
      'On Hold': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Onboarding Dashboard</h1>
        <a
          href="/new"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Request
        </a>
      </div>

      {/* Statistics Cards */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600 mb-1">Total Requests</p>
          <p class="text-3xl font-bold">{statsData()?.total || 0}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600 mb-1">In Progress</p>
          <p class="text-3xl font-bold">
            {statsData()?.byStatus?.['In Progress'] || 0}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600 mb-1">Completed</p>
          <p class="text-3xl font-bold">
            {statsData()?.byStatus?.['Completed'] || 0}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600 mb-1">Under Review</p>
          <p class="text-3xl font-bold">
            {statsData()?.byStatus?.['Under Review'] || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div class="bg-white rounded-lg shadow p-4 mb-4">
        <div class="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter()}
            onChange={(e) => setStatusFilter(e.currentTarget.value)}
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trading Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <Show
                when={requestsData()?.data && requestsData()!.data.length > 0}
                fallback={
                  <tr>
                    <td colSpan={8} class="px-6 py-4 text-center text-gray-500">
                      No requests found
                    </td>
                  </tr>
                }
              >
                <For each={requestsData()?.data}>
                  {(request) => (
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.referenceNumber}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.tradingName}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.contactEmail}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          class={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.assignedTeam || 'Unassigned'}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div
                            class="bg-blue-600 h-2 rounded-full"
                            style={`width: ${request.completionPercentage}%`}
                          />
                        </div>
                        <span class="text-xs text-gray-500">
                          {request.completionPercentage}%
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/request/${request.id}`)}
                          class="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </Show>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

