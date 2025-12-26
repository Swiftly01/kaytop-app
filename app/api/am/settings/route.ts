import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { APIErrorHandler } from '@/lib/api/errorHandler';

/**
 * GET /api/am/settings
 * Proxy to backend profile and settings endpoints for Account Manager settings
 */
export async function GET(request: NextRequest) {
  try {
    // Get profile data and system settings
    const [profileResponse, statesResponse, branchesResponse] = await Promise.all([
      apiClient.get(API_ENDPOINTS.ADMIN.PROFILE),
      apiClient.get(API_ENDPOINTS.USERS.STATES),
      apiClient.get(API_ENDPOINTS.USERS.BRANCHES)
    ]);
    
    // Combine the data into settings format
    const settingsData = {
      profile: profileResponse.data,
      states: statesResponse.data || [],
      branches: branchesResponse.data || []
    };
    
    return NextResponse.json(settingsData);
  } catch (error) {
    return APIErrorHandler.handleAPIError(error, 'Failed to fetch settings');
  }
}

/**
 * PUT /api/am/settings
 * Proxy to backend profile update endpoint for Account Manager settings updates
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await apiClient.put(API_ENDPOINTS.ADMIN.PROFILE, body);
    
    return NextResponse.json(response.data);
  } catch (error) {
    return APIErrorHandler.handleAPIError(error, 'Failed to update settings');
  }
}

/**
 * POST /api/am/settings/password
 * Proxy to backend password change endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, body);
    
    return NextResponse.json(response.data);
  } catch (error) {
    return APIErrorHandler.handleAPIError(error, 'Failed to change password');
  }
}