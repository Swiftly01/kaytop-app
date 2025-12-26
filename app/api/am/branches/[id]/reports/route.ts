import { NextRequest, NextResponse } from 'next/server';

/**
 * Account Manager Branch Reports Endpoint
 * GET /api/am/branches/[id]/reports
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock reports data - replace with actual database queries
    const mockReports = [
      {
        id: 'report-001',
        reportId: 'RPT-2024-001',
        creditOfficer: 'John Doe',
        creditOfficerId: 'co-001',
        branchName: 'Lagos Central Branch',
        branchId: id,
        status: 'pending',
        dateSubmitted: '2024-12-20',
        timeSent: '14:30',
        loansDisburse: 15,
        loansValueDisbursed: 2500000,
        savingsCollected: 1800000,
        repaymentsCollected: 3200000,
        notes: 'Monthly report for December 2024'
      },
      {
        id: 'report-002',
        reportId: 'RPT-2024-002',
        creditOfficer: 'Jane Smith',
        creditOfficerId: 'co-002',
        branchName: 'Lagos Central Branch',
        branchId: id,
        status: 'approved',
        dateSubmitted: '2024-12-19',
        timeSent: '16:45',
        loansDisburse: 12,
        loansValueDisbursed: 1900000,
        savingsCollected: 1500000,
        repaymentsCollected: 2800000,
        notes: 'Weekly report - Week 3 December'
      },
      {
        id: 'report-003',
        reportId: 'RPT-2024-003',
        creditOfficer: 'Mike Johnson',
        creditOfficerId: 'co-003',
        branchName: 'Lagos Central Branch',
        branchId: id,
        status: 'declined',
        dateSubmitted: '2024-12-18',
        timeSent: '11:20',
        loansDisburse: 8,
        loansValueDisbursed: 1200000,
        savingsCollected: 900000,
        repaymentsCollected: 1600000,
        notes: 'Report declined due to incomplete documentation'
      }
    ];

    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = mockReports.slice(startIndex, endIndex);

    const response = {
      data: paginatedReports,
      pagination: {
        page,
        limit,
        total: mockReports.length,
        totalPages: Math.ceil(mockReports.length / limit)
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('AM Branch reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AM branch reports', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}