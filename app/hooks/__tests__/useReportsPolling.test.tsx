import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReportsPolling } from '../useReportsPolling';
import { reportsService } from '@/lib/services/reports';
import React from 'react';

// Mock the reports service
jest.mock('@/lib/services/reports', () => ({
  reportsService: {
    getAllReports: jest.fn(),
    getReportStatistics: jest.fn(),
  },
}));

const mockReportsService = reportsService as jest.Mocked<typeof reportsService>;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useReportsPolling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReportsService.getAllReports.mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'Test Report',
          description: 'Test Description',
          status: 'pending',
          creditOfficerId: 'co1',
          branchId: 'branch1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    mockReportsService.getReportStatistics.mockResolvedValue({
      totalReports: 1,
      pendingReports: 1,
      approvedReports: 0,
      declinedReports: 0,
      overdueReports: 0,
    });
  });

  it('should fetch reports data on mount', async () => {
    const { result } = renderHook(
      () => useReportsPolling({}, { enabled: true, pollingInterval: 1000 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.reports).toBeDefined();
    });

    expect(mockReportsService.getAllReports).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  it('should fetch statistics data on mount', async () => {
    const { result } = renderHook(
      () => useReportsPolling({}, { enabled: true, pollingInterval: 1000 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.statistics).toBeDefined();
    });

    expect(mockReportsService.getReportStatistics).toHaveBeenCalledWith({});
  });

  it('should apply filters correctly', async () => {
    const filters = {
      branchId: 'branch1',
      status: 'pending',
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
    };

    renderHook(
      () => useReportsPolling(filters, { enabled: true, pollingInterval: 1000 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(mockReportsService.getAllReports).toHaveBeenCalledWith({
        ...filters,
        page: 1,
        limit: 10,
      });
    });

    expect(mockReportsService.getReportStatistics).toHaveBeenCalledWith({
      branchId: filters.branchId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
  });

  it('should handle disabled polling', () => {
    const { result } = renderHook(
      () => useReportsPolling({}, { enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isPolling).toBe(false);
    expect(mockReportsService.getAllReports).not.toHaveBeenCalled();
  });

  it('should provide manual refresh functionality', async () => {
    const { result } = renderHook(
      () => useReportsPolling({}, { enabled: true, pollingInterval: 1000 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.refresh).toBeDefined();
    });

    // Call manual refresh
    await result.current.refresh();

    // Should have been called at least twice (initial + manual refresh)
    expect(mockReportsService.getAllReports).toHaveBeenCalledTimes(2);
  });

  it('should handle API errors gracefully', async () => {
    const error = new Error('API Error');
    mockReportsService.getAllReports.mockRejectedValue(error);

    const { result } = renderHook(
      () => useReportsPolling({}, { enabled: true, pollingInterval: 1000 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.reportsError).toBeDefined();
    });

    expect(result.current.reportsError).toBe(error);
  });
});