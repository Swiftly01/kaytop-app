/**
 * Account Manager Base API Route
 * Provides AM-specific endpoints that proxy to the real backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAuth } from '@/lib/api/middleware/auth';
import { UserRole } from '@/lib/utils/roleUtils';

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

    // Return AM API information
    return NextResponse.json({
      success: true,
      message: 'Account Manager API is available',
      endpoints: {
        dashboard: '/api/am/dashboard/kpi',
        branches: '/api/am/branches',
        customers: '/api/am/customers',
        loans: '/api/am/loans',
        reports: '/api/am/reports',
        profile: '/api/am/profile',
        settings: '/api/am/settings'
      },
      version: '1.0.0'
    });

  } catch (error) {
    console.error('AM API Base Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}