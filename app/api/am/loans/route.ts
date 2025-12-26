/**
 * Account Manager Loans API Route - Real Backend Integration
 * Provides loan pipeline management for AM by proxying to real KAYTOP backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/api/middleware/auth';
import { UserRole } from '@/lib/utils/roleUtils';
import { API_CONFIG } from '@/lib/api/config';
import { DataTransformers } from '@/lib/api/transformers';
import { APIErrorHandler } from '@/lib/api/errorHandler';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication and role
    const authResult = await validateAuth(request, [
      UserRole.SYSTEM_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.ACCOUNT_MANAGER
    ]);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    console.log('🔄 Proxying loans request to backend:', {
      endpoint: '/loans/all',
      queryParams: queryString,
      userRole: authResult.user?.role,
      baseUrl: API_CONFIG.BASE_URL
    });

    // Forward request to real backend - use /loans/all endpoint from Postman collection
    const backendResponse = await fetch(
      `${API_CONFIG.BASE_URL}/loans/all${queryString ? `?${queryString}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authResult.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!backendResponse.ok) {
      console.error('❌ Backend loans request failed:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText
      });

      let errorMessage = 'Failed to fetch loans from backend';
      try {
        const errorData = await backendResponse.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = backendResponse.statusText || errorMessage;
      }

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: backendResponse.status }
      );
    }

    // Parse backend response
    const backendData = await backendResponse.json();
    
    console.log('✅ Backend loans response received:', {
      hasData: !!backendData,
      dataType: typeof backendData,
      isArray: Array.isArray(backendData)
    });

    // Transform backend response to match frontend expectations
    let transformedData;
    
    if (Array.isArray(backendData)) {
      // Direct array format
      const loans = DataTransformers.transformArray(backendData, DataTransformers.transformLoan);
      transformedData = {
        success: true,
        data: {
          loans,
          pagination: {
            page: 1,
            limit: loans.length,
            total: loans.length,
            totalPages: 1
          },
          pipelineSummary: calculatePipelineSummary(loans)
        }
      };
    } else if (backendData.success && backendData.data) {
      // Wrapped format
      const loans = Array.isArray(backendData.data) 
        ? DataTransformers.transformArray(backendData.data, DataTransformers.transformLoan)
        : DataTransformers.transformArray([backendData.data], DataTransformers.transformLoan);
      
      transformedData = {
        success: true,
        data: {
          loans,
          pagination: backendData.pagination || {
            page: 1,
            limit: loans.length,
            total: loans.length,
            totalPages: 1
          },
          pipelineSummary: calculatePipelineSummary(loans)
        }
      };
    } else {
      // Fallback for unexpected format
      transformedData = {
        success: true,
        data: {
          loans: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          },
          pipelineSummary: {
            totalApplications: 0,
            pendingReview: 0,
            inDocumentation: 0,
            awaitingApproval: 0,
            readyForDisbursement: 0,
            totalValue: 0,
            averageAmount: 0,
            conversionRate: 0
          }
        }
      };
    }

    console.log('✅ Transformed loans data:', {
      loanCount: transformedData.data.loans.length,
      totalValue: transformedData.data.pipelineSummary.totalValue
    });

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ AM Loans API Error:', error);
    
    const errorMessage = APIErrorHandler.handleApiError(error, { logError: true });
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to calculate pipeline summary from loan data
function calculatePipelineSummary(loans: any[]) {
  const totalApplications = loans.length;
  const totalValue = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const averageAmount = totalApplications > 0 ? totalValue / totalApplications : 0;

  // Count loans by stage/status
  const pendingReview = loans.filter(l => l.status === 'pending' || l.stage === 'review').length;
  const inDocumentation = loans.filter(l => l.stage === 'documentation').length;
  const awaitingApproval = loans.filter(l => l.stage === 'approval' || l.status === 'approved').length;
  const readyForDisbursement = loans.filter(l => l.stage === 'disbursement' || l.status === 'disbursed').length;

  return {
    totalApplications,
    pendingReview,
    inDocumentation,
    awaitingApproval,
    readyForDisbursement,
    totalValue,
    averageAmount,
    conversionRate: totalApplications > 0 ? (awaitingApproval + readyForDisbursement) / totalApplications : 0
  };
}