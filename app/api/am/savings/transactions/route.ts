import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { handleAPIError } from '@/lib/api/errorHandler';

/**
 * GET /api/am/savings/transactions
 * Proxy to backend /savings/transactions/all endpoint for Account Manager transaction management
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward query parameters to backend
    const queryString = searchParams.toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.SAVINGS.ALL_TRANSACTIONS}?${queryString}`
      : API_ENDPOINTS.SAVINGS.ALL_TRANSACTIONS;

    const response = await apiClient.get(endpoint);
    
    return NextResponse.json(response.data);
  } catch (error) {
    return handleAPIError(error, 'Failed to fetch savings transactions');
  }
}