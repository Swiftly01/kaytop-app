import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { handleAPIError } from '@/lib/api/errorHandler';

/**
 * POST /api/am/savings/transactions/[id]/approve-withdraw
 * Proxy to backend /savings/transactions/{id}/approve-withdraw endpoint for withdrawal approval
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const response = await apiClient.post(
      API_ENDPOINTS.SAVINGS.APPROVE_WITHDRAWAL(id),
      body
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    return handleAPIError(error, 'Failed to approve withdrawal');
  }
}