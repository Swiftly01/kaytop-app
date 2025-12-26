import { NextRequest, NextResponse } from 'next/server';

/**
 * Account Manager Branch Details Endpoint
 * GET /api/am/branches/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mock branch details data - replace with actual database queries
    const mockBranchDetails = {
      id: id,
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
      updatedAt: '2024-12-20T14:22:00Z',
      statistics: {
        totalCreditOfficers: 8,
        totalCustomers: 245,
        activeLoans: 156,
        loansProcessed: 892,
        creditOfficersGrowth: 14.3,
        customersGrowth: 22.1,
        activeLoansGrowth: 18.7,
        loansProcessedGrowth: 25.4
      }
    };

    return NextResponse.json(mockBranchDetails);
  } catch (error) {
    console.error('AM Branch details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AM branch details', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}