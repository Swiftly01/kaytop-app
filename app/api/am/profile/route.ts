import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { APIErrorHandler } from '@/lib/api/errorHandler';

/**
 * GET /api/am/profile
 * Proxy to backend /admin/profile endpoint for Account Manager profile
 */
export async function GET(request: NextRequest) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.PROFILE);
    
    return NextResponse.json(response.data);
  } catch (error) {
    return APIErrorHandler.handleAPIError(error, 'Failed to fetch profile');
  }
}

/**
 * PUT /api/am/profile
 * Proxy to backend /admin/profile endpoint for Account Manager profile updates
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await apiClient.put(API_ENDPOINTS.ADMIN.PROFILE, body);
    
    return NextResponse.json(response.data);
  } catch (error) {
    return APIErrorHandler.handleAPIError(error, 'Failed to update profile');
  }
}