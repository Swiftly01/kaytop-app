import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { handleAPIError } from '@/lib/api/errorHandler';

/**
 * GET /api/am/savings/customer/[id]
 * Proxy to backend /savings/customer/{id} endpoint for customer savings management
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    // Forward query parameters to backend
    const queryString = searchParams.toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.SAVINGS.CUSTOMER_SAVINGS(id)}?${queryString}`
      : API_ENDPOINTS.SAVINGS.CUSTOMER_SAVINGS(id);

    const response = await apiClient.get(endpoint);
    
    return NextResponse.json(response.data);
  } catch (error) {
    return handleAPIError(error, 'Failed to fetch customer savings');
  }
}