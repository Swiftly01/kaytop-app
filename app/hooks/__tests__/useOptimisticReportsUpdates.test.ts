import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimisticReportsUpdates } from '../useOptimisticReportsUpdates';
import { reportsService } from '@/lib/services/reports';
import React from 'react';

// Mock the reports service
jest.mock('@/lib/services/reports', () => ({
  reportsService: {
    approveReport: jest.fn(),
    declineReport: jest.fn(),
    updateReport: jest.fn(),
    deleteReport: jest.fn(),
  },
}));

const mockReportsService = reportsService as jest.Mocked<typeof reportsService>;

// Test wrapper with QueryClient