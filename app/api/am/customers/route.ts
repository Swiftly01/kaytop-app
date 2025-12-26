/**
 * Account Manager Customers API Route - Real Backend Integration
 * Provides customer portfolio management for AM by proxying to real KAYTOP backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/api/middleware/auth';
import { UserRole } from '@/lib/utils/roleUtils';
import { API_CONFIG } from '@/lib/api/config';
import { DataTransformers } from '@/lib/api/transformers';
import { APIErrorHandler } from '@/lib/api/errorHandler';

// Helper function to calculate portfolio summary from customer data
function calculatePortfolioSummary(customers: any[]) {
  return {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.verificationStatus === 'verified').length,
    totalPortfolioValue: 0, // This would need to be calculated from actual loan/savings data
    totalLoanBalance: 0,
    totalSavingsBalance: 0,
    averageRiskScore: 'low' // Simplified calculation
  };
}

export async function GET(request: NextRequest) {
  try {
    // Validate authentication and role
    const authResult = await validateAuth(request, [
      UserRole.SYSTEM_ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.ACCOUNT_MANAGER,
      UserRole.HQ_MANAGER
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

    console.log('🔄 Proxying customer request to backend:', {
      endpoint: '/admin/users',
      queryParams: queryString,
      userRole: authResult.user?.role,
      baseUrl: API_CONFIG.BASE_URL
    });

    // Forward request to real backend
    const backendResponse = await fetch(
      `${API_CONFIG.BASE_URL}/admin/users${queryString ? `?${queryString}` : ''}`,
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
      console.error('❌ Backend customer request failed:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText
      });

      let errorMessage = 'Failed to fetch customers from backend';
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
    
    console.log('✅ Backend customer response received:', {
      hasData: !!backendData,
      dataType: typeof backendData,
      isArray: Array.isArray(backendData)
    });

    // Transform backend response to match frontend expectations
    let transformedData;
    
    if (Array.isArray(backendData)) {
      // Direct array format
      const customers = DataTransformers.transformArray(backendData, DataTransformers.transformUser);
      transformedData = {
        success: true,
        data: {
          customers,
          pagination: {
            page: 1,
            limit: customers.length,
            total: customers.length,
            totalPages: 1
          },
          portfolioSummary: calculatePortfolioSummary(customers)
        }
      };
    } else if (backendData.success && backendData.data) {
      // Wrapped format
      const customers = Array.isArray(backendData.data) 
        ? DataTransformers.transformArray(backendData.data, DataTransformers.transformUser)
        : DataTransformers.transformArray([backendData.data], DataTransformers.transformUser);
      
      transformedData = {
        success: true,
        data: {
          customers,
          pagination: backendData.pagination || {
            page: 1,
            limit: customers.length,
            total: customers.length,
            totalPages: 1
          },
          portfolioSummary: calculatePortfolioSummary(customers)
        }
      };
    } else {
      // Fallback for unexpected format
      transformedData = {
        success: true,
        data: {
          customers: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          },
          portfolioSummary: {
            totalCustomers: 0,
            activeCustomers: 0,
            totalPortfolioValue: 0,
            totalLoanBalance: 0,
            totalSavingsBalance: 0,
            averageRiskScore: 'low'
          }
        }
      };
    }

    console.log('✅ Transformed customer data:', {
      customerCount: transformedData.data.customers.length,
      portfolioValue: transformedData.data.portfolioSummary.totalPortfolioValue
    });

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ AM Customers API Error:', error);
    
    const errorMessage = APIErrorHandler.handleApiError(error, { logError: true });
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}