/**
 * Tests for API Data Transformers
 * Verifies that the pagination error fix works correctly
 */

import { DataTransformers } from '../transformers';
import type { Report, PaginatedResponse } from '../types';

describe('DataTransformers', () => {
  describe('transformPaginatedResponse', () => {
    const mockTransformReport = (item: any): Report => ({
      id: item.id?.toString() || '',
      reportId: item.reportId?.toString() || '',
      creditOfficer: item.creditOfficer || 'Test Officer',
      creditOfficerId: item.creditOfficerId?.toString() || '',
      branch: item.branch || 'Test Branch',
      branchId: item.branchId?.toString() || '',
      email: item.email || 'test@example.com',
      dateSent: item.dateSent || '2024-01-01',
      timeSent: item.timeSent || '10:00:00',
      reportType: item.reportType || 'daily',
      status: item.status || 'pending',
      isApproved: item.isApproved || false,
      loansDispursed: item.loansDispursed || 0,
      loansValueDispursed: item.loansValueDispursed || '0',
      savingsCollected: item.savingsCollected || '0',
      repaymentsCollected: item.repaymentsCollected || 0,
      createdAt: item.createdAt || '2024-01-01T10:00:00Z',
      updatedAt: item.updatedAt || '2024-01-01T10:00:00Z',
    });

    it('should handle null/undefined response gracefully', () => {
      const result = DataTransformers.transformPaginatedResponse(null, mockTransformReport);
      
      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('should handle undefined response gracefully', () => {
      const result = DataTransformers.transformPaginatedResponse(undefined, mockTransformReport);
      
      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('should handle response without pagination object', () => {
      const mockResponse = {
        data: [
          { id: 1, reportId: 'R001', creditOfficer: 'John Doe' },
          { id: 2, reportId: 'R002', creditOfficer: 'Jane Smith' },
        ],
      };

      const result = DataTransformers.transformPaginatedResponse(mockResponse, mockTransformReport);
      
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should handle response with meta object (backend format)', () => {
      const mockResponse = {
        data: [
          { id: 1, reportId: 'R001', creditOfficer: 'John Doe' },
        ],
        meta: {
          page: 2,
          limit: 5,
          total: 15,
          totalPages: 3,
        },
      };

      const result = DataTransformers.transformPaginatedResponse(mockResponse, mockTransformReport);
      
      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should handle response with pagination object', () => {
      const mockResponse = {
        data: [
          { id: 1, reportId: 'R001', creditOfficer: 'John Doe' },
        ],
        pagination: {
          page: 3,
          limit: 20,
          total: 100,
          totalPages: 5,
        },
      };

      const result = DataTransformers.transformPaginatedResponse(mockResponse, mockTransformReport);
      
      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(3);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(100);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle direct array response', () => {
      const mockResponse = [
        { id: 1, reportId: 'R001', creditOfficer: 'John Doe' },
        { id: 2, reportId: 'R002', creditOfficer: 'Jane Smith' },
        { id: 3, reportId: 'R003', creditOfficer: 'Bob Johnson' },
      ];

      const result = DataTransformers.transformPaginatedResponse(mockResponse, mockTransformReport);
      
      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should handle transformation errors gracefully', () => {
      const mockResponse = {
        data: [
          { id: 1, reportId: 'R001' }, // Valid item
          null, // Invalid item that will cause transformation error
          { id: 2, reportId: 'R002' }, // Valid item
        ],
      };

      // Mock transformer that throws error for null items
      const errorProneTransformer = (item: any): Report => {
        if (item === null) {
          throw new Error('Cannot transform null item');
        }
        return mockTransformReport(item);
      };

      const result = DataTransformers.transformPaginatedResponse(mockResponse, errorProneTransformer);
      
      // Should filter out failed transformations
      expect(result.data).toHaveLength(2);
      expect(result.data[0].reportId).toBe('R001');
      expect(result.data[1].reportId).toBe('R002');
    });

    it('should handle empty data array', () => {
      const mockResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      const result = DataTransformers.transformPaginatedResponse(mockResponse, mockTransformReport);
      
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should calculate totalPages when missing', () => {
      const mockResponse = {
        data: [
          { id: 1, reportId: 'R001' },
          { id: 2, reportId: 'R002' },
        ],
        meta: {
          page: 1,
          limit: 1,
          total: 2,
          // totalPages missing - should be calculated
        },
      };

      const result = DataTransformers.transformPaginatedResponse(mockResponse, mockTransformReport);
      
      expect(result.pagination.totalPages).toBe(2); // Math.ceil(2 / 1)
    });
  });

  describe('transformReport', () => {
    it('should transform backend report data correctly', () => {
      const backendReport = {
        id: 123,
        reportId: 'R001',
        user: {
          id: 456,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          branch: 'Lagos Branch',
        },
        status: 'pending',
        reportType: 'daily',
        createdAt: '2024-01-01T10:00:00Z',
      };

      const result = DataTransformers.transformReport(backendReport);
      
      expect(result.id).toBe('123');
      expect(result.reportId).toBe('R001');
      expect(result.creditOfficer).toBe('John Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.branch).toBe('Lagos Branch');
      expect(result.status).toBe('pending');
      expect(result.reportType).toBe('daily');
    });
  });
});