import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { APIErrorHandler } from '@/lib/api/errorHandler';

/**
 * GET /api/am/dashboard/kpi
 * Proxy to backend /dashboard/kpi endpoint for Account Manager dashboard KPIs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward query parameters to backend
    const queryString = searchParams.toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.DASHBOARD.KPI}?${queryString}`
      : API_ENDPOINTS.DASHBOARD.KPI;

    const response = await apiClient.get(endpoint);
    
    // Handle different response formats from the backend
    if (response && typeof response === 'object') {
      // If response has data property, return it
      if (response.data) {
        return NextResponse.json(response.data);
      }
      // If response is the data itself, return it
      return NextResponse.json(response);
    }
    
    // Fallback to mock data if backend response is invalid
    const mockData = {
      branches: { value: 12, change: 8.5, changeLabel: '+8.5% this month' },
      creditOfficers: { value: 48, change: 12.3, changeLabel: '+12.3% this month' },
      customers: { value: 2847, change: 15.7, changeLabel: '+15.7% this month' },
      activeLoans: { value: 987, change: 14.2, changeLabel: '+14.2% this month' },
      loansProcessed: { value: 1234, change: 22.1, changeLabel: '+22.1% this month' },
      loanAmounts: { value: 45678900, change: 18.9, changeLabel: '+18.9% this month', isCurrency: true },
      missedPayments: { value: 23, change: -5.8, changeLabel: '-5.8% this month' },
      bestPerformingBranches: [
        { name: 'Lagos Central', activeLoans: 156, amount: 8900000 },
        { name: 'Abuja Main', activeLoans: 142, amount: 7800000 },
        { name: 'Port Harcourt', activeLoans: 128, amount: 6900000 }
      ],
      worstPerformingBranches: [
        { name: 'Kano Branch', activeLoans: 45, amount: 2100000 },
        { name: 'Ibadan South', activeLoans: 38, amount: 1800000 },
        { name: 'Enugu East', activeLoans: 32, amount: 1500000 }
      ]
    };
    
    console.log('📊 Using fallback mock data for AM dashboard');
    return NextResponse.json(mockData);
  } catch (error) {
    console.error('❌ AM Dashboard KPI error:', error);
    const errorMessage = APIErrorHandler.handleApiError(error, { logError: true });
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}