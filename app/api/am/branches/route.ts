import { NextRequest, NextResponse } from 'next/server';

/**
 * Account Manager Branches Endpoint
 * GET /api/am/branches
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🏢 AM Branches API called:', request.url);
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('📊 Query params:', { page, limit });

    // Mock branches data - replace with actual database queries
    const mockBranches = [
      {
        id: 'branch-001',
        name: 'Lagos Central Branch',
        code: 'LCB001',
        address: '123 Marina Street, Lagos Island, Lagos',
        state: 'Lagos',
        region: 'South West',
        manager: 'Adebayo Johnson',
        managerId: 'mgr-001',
        phone: '+234-801-234-5678',
        email: 'lagos.central@kaytop.com',
        status: 'active',
        dateCreated: '2023-01-15',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2024-12-20T14:22:00Z'
      },
      {
        id: 'branch-002',
        name: 'Abuja Main Branch',
        code: 'AMB002',
        address: '456 Central Business District, Abuja',
        state: 'FCT',
        region: 'North Central',
        manager: 'Fatima Abdullahi',
        managerId: 'mgr-002',
        phone: '+234-802-345-6789',
        email: 'abuja.main@kaytop.com',
        status: 'active',
        dateCreated: '2023-02-20',
        createdAt: '2023-02-20T09:15:00Z',
        updatedAt: '2024-12-19T16:45:00Z'
      },
      {
        id: 'branch-003',
        name: 'Port Harcourt Branch',
        code: 'PHB003',
        address: '789 Trans Amadi Road, Port Harcourt',
        state: 'Rivers',
        region: 'South South',
        manager: 'Emeka Okafor',
        managerId: 'mgr-003',
        phone: '+234-803-456-7890',
        email: 'portharcourt@kaytop.com',
        status: 'active',
        dateCreated: '2023-03-10',
        createdAt: '2023-03-10T11:20:00Z',
        updatedAt: '2024-12-18T13:30:00Z'
      }
    ];

    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBranches = mockBranches.slice(startIndex, endIndex);

    const response = {
      data: paginatedBranches,
      pagination: {
        page,
        limit,
        total: mockBranches.length,
        totalPages: Math.ceil(mockBranches.length / limit)
      }
    };

    console.log('✅ AM Branches response:', { 
      dataCount: paginatedBranches.length, 
      pagination: response.pagination 
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ AM Branches error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AM branches', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}