import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api/config';

/**
 * Unified Authentication Endpoint - Real Backend Integration
 * POST /api/auth/login
 * 
 * This endpoint now proxies authentication requests to the real KAYTOP backend
 * instead of using mock data.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, userType } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Forward authentication request to real backend
    console.log('🔄 Attempting authentication with backend:', {
      url: `${API_CONFIG.BASE_URL}/auth/login`,
      email,
      userType: userType || 'admin'
    });

    const backendResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        userType: userType || 'admin' // Default to admin if not specified
      }),
    });

    // Handle backend response
    if (!backendResponse.ok) {
      let errorMessage = 'Authentication failed';
      
      try {
        const errorData = await backendResponse.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('❌ Backend authentication error:', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          error: errorData
        });
      } catch (parseError) {
        // If we can't parse error response, use status text
        errorMessage = backendResponse.statusText || errorMessage;
        console.error('❌ Backend authentication error (unparseable):', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          parseError
        });
      }

      return NextResponse.json(
        { 
          error: 'Invalid credentials', 
          message: errorMessage,
          success: false 
        },
        { status: backendResponse.status }
      );
    }

    // Parse successful response from backend
    const authData = await backendResponse.json();
    
    // Backend returns format: { access_token: "jwt...", role: "system_admin", ... }
    // Transform to match frontend expectations
    const response = {
      success: true,
      message: 'Login successful',
      access_token: authData.access_token || authData.token,
      token_type: 'Bearer',
      expires_in: authData.expires_in || 3600,
      role: authData.role,
      user: {
        id: authData.user?.id || authData.id || 'user-' + Date.now(),
        firstName: authData.user?.firstName || authData.firstName || 'User',
        lastName: authData.user?.lastName || authData.lastName || '',
        email: email,
        role: authData.role,
        branch: authData.user?.branch || authData.branch || '',
        state: authData.user?.state || authData.state || '',
        verificationStatus: authData.user?.verificationStatus || 'verified'
      }
    };

    // Log successful authentication (remove in production)
    console.log('✅ Authentication successful:', {
      email,
      role: response.role,
      hasToken: !!response.access_token
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Authentication error:', error);
    
    // Handle network errors or other issues
    return NextResponse.json(
      { 
        error: 'Authentication failed', 
        message: error instanceof Error ? error.message : 'Unable to connect to authentication server',
        success: false 
      },
      { status: 500 }
    );
  }
}