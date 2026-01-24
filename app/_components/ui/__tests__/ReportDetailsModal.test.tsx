/**
 * ReportDetailsModal Component Tests
 * Tests for the report details modal integration with API data
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportDetailsModal, { ReportDetailsData } from '../ReportDetailsModal';

describe('ReportDetailsModal', () => {
  const mockReportData: ReportDetailsData = {
    reportId: 'RPT-001',
    creditOfficer: 'John Doe',
    branch: 'Main Branch',
    email: 'john@example.com',
    dateSent: 'Dec 30, 2022',
    timeSent: '14:30',
    reportType: 'Daily Report',
    status: 'pending',
    isApproved: false,
    loansDispursed: 5,
    loansValueDispursed: '₦300,000',
    savingsCollected: '₦150,000',
    repaymentsCollected: 3,
    approvalHistory: [
      {
        action: 'approved',
        actionBy: 'Manager Smith',
        actionAt: '2024-01-15T10:30:00Z',
        comments: 'Report approved after review'
      }
    ]
  };

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    reportData: mockReportData,
    onApprove: jest.fn(),
    onDecline: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Detail Fetching Integration', () => {
    it('should display complete report details including all metadata fields', () => {
      // Requirements: 10.1, 10.2
      render(<ReportDetailsModal {...mockProps} />);

      // Verify all required metadata fields are displayed
      expect(screen.getByText('Report Details')).toBeInTheDocument();
      expect(screen.getByText('RPT-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Main Branch')).toBeInTheDocument();
      expect(screen.getByText('Dec 30, 2022')).toBeInTheDocument();
      expect(screen.getByText('14:30')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // loansDispursed
      expect(screen.getByText('₦300,000')).toBeInTheDocument(); // loansValueDispursed
      expect(screen.getByText('₦150,000')).toBeInTheDocument(); // savingsCollected
      expect(screen.getByText('3')).toBeInTheDocument(); // repaymentsCollected
    });

    it('should display approval history timeline when available', () => {
      // Requirements: 10.3
      render(<ReportDetailsModal {...mockProps} />);

      expect(screen.getByText('Approval History')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('By: Manager Smith')).toBeInTheDocument();
      expect(screen.getByText('Report approved after review')).toBeInTheDocument();
      expect(screen.getByText('1/15/2024')).toBeInTheDocument(); // Formatted date
    });

    it('should handle missing approval history gracefully', () => {
      // Requirements: 10.3
      const propsWithoutHistory = {
        ...mockProps,
        reportData: {
          ...mockReportData,
          approvalHistory: undefined
        }
      };

      render(<ReportDetailsModal {...propsWithoutHistory} />);

      expect(screen.queryByText('Approval History')).not.toBeInTheDocument();
    });

    it('should handle missing optional metadata fields gracefully', () => {
      // Requirements: 10.2
      const minimalReportData: ReportDetailsData = {
        reportId: 'RPT-002',
        creditOfficer: 'Jane Smith',
        branch: 'Branch 2',
        email: 'jane@example.com',
        dateSent: 'Jan 1, 2023',
        timeSent: '09:00'
      };

      const minimalProps = {
        ...mockProps,
        reportData: minimalReportData
      };

      render(<ReportDetailsModal {...minimalProps} />);

      expect(screen.getByText('RPT-002')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      // Should handle missing optional fields without crashing
    });
  });

  describe('Modal Actions Integration', () => {
    it('should call onApprove when approve button is clicked', async () => {
      // Requirements: 10.4
      render(<ReportDetailsModal {...mockProps} />);

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      expect(mockProps.onApprove).toHaveBeenCalledTimes(1);
    });

    it('should call onDecline when decline button is clicked', async () => {
      // Requirements: 10.4
      render(<ReportDetailsModal {...mockProps} />);

      const declineButton = screen.getByText('Decline');
      fireEvent.click(declineButton);

      expect(mockProps.onDecline).toHaveBeenCalledTimes(1);
    });

    it('should show action buttons for non-approved reports', () => {
      // Requirements: 10.4
      render(<ReportDetailsModal {...mockProps} />);

      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Decline')).toBeInTheDocument();
    });

    it('should hide action buttons for approved reports', () => {
      // Requirements: 10.4
      const approvedReportProps = {
        ...mockProps,
        reportData: {
          ...mockReportData,
          isApproved: true
        }
      };

      render(<ReportDetailsModal {...approvedReportProps} />);

      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
      expect(screen.queryByText('Decline')).not.toBeInTheDocument();
      expect(screen.getByText('Report approved and is locked')).toBeInTheDocument();
    });

    it('should allow approval/decline actions from the details modal', () => {
      // Requirements: 10.4
      render(<ReportDetailsModal {...mockProps} />);

      const approveButton = screen.getByText('Approve');
      const declineButton = screen.getByText('Decline');

      expect(approveButton).toBeEnabled();
      expect(declineButton).toBeEnabled();

      // Test that buttons are clickable and call handlers
      fireEvent.click(approveButton);
      expect(mockProps.onApprove).toHaveBeenCalledTimes(1);

      fireEvent.click(declineButton);
      expect(mockProps.onDecline).toHaveBeenCalledTimes(1);
    });
  });

  describe('Parent List Updates Integration', () => {
    it('should trigger parent list update when modal actions are performed', async () => {
      // Requirements: 10.5
      const mockOnApprove = jest.fn();
      const mockOnDecline = jest.fn();
      
      const propsWithMockHandlers = {
        ...mockProps,
        onApprove: mockOnApprove,
        onDecline: mockOnDecline
      };

      render(<ReportDetailsModal {...propsWithMockHandlers} />);

      // Test approve action triggers parent update
      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      expect(mockOnApprove).toHaveBeenCalledTimes(1);

      // Test decline action triggers parent update
      const declineButton = screen.getByText('Decline');
      fireEvent.click(declineButton);

      expect(mockOnDecline).toHaveBeenCalledTimes(1);
    });

    it('should close modal and reset state after successful actions', () => {
      // Requirements: 10.5
      const mockOnClose = jest.fn();
      
      const propsWithCloseHandler = {
        ...mockProps,
        onClose: mockOnClose
      };

      render(<ReportDetailsModal {...propsWithCloseHandler} />);

      // Test close button functionality
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle escape key to close modal and update parent state', () => {
      // Requirements: 10.5
      const mockOnClose = jest.fn();
      
      const propsWithCloseHandler = {
        ...mockProps,
        onClose: mockOnClose
      };

      render(<ReportDetailsModal {...propsWithCloseHandler} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle backdrop click to close modal', () => {
      // Requirements: 10.5
      const mockOnClose = jest.fn();
      
      const propsWithCloseHandler = {
        ...mockProps,
        onClose: mockOnClose
      };

      render(<ReportDetailsModal {...propsWithCloseHandler} />);

      // Click on the backdrop (the outer div with backdrop click handler)
      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Visibility and State Management', () => {
    it('should not render when isOpen is false', () => {
      // Requirements: 10.1
      const closedModalProps = {
        ...mockProps,
        isOpen: false
      };

      render(<ReportDetailsModal {...closedModalProps} />);

      expect(screen.queryByText('Report Details')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      // Requirements: 10.1
      render(<ReportDetailsModal {...mockProps} />);

      expect(screen.getByText('Report Details')).toBeInTheDocument();
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should have proper ARIA attributes for accessibility', () => {
      // Requirements: 10.1, 10.2
      render(<ReportDetailsModal {...mockProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

      const title = screen.getByText('Report Details');
      expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('should have proper button labels for screen readers', () => {
      // Requirements: 10.4
      render(<ReportDetailsModal {...mockProps} />);

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
      expect(screen.getByLabelText('Approve report')).toBeInTheDocument();
      expect(screen.getByLabelText('Decline report')).toBeInTheDocument();
    });
  });

  describe('Data Format Consistency', () => {
    it('should format approval history dates correctly', () => {
      // Requirements: 10.3
      const reportWithHistory = {
        ...mockReportData,
        approvalHistory: [
          {
            action: 'declined' as const,
            actionBy: 'Manager Jones',
            actionAt: '2024-01-16T15:45:30Z',
            comments: 'Needs more information'
          }
        ]
      };

      const propsWithHistory = {
        ...mockProps,
        reportData: reportWithHistory
      };

      render(<ReportDetailsModal {...propsWithHistory} />);

      expect(screen.getByText('Declined')).toBeInTheDocument();
      expect(screen.getByText('By: Manager Jones')).toBeInTheDocument();
      expect(screen.getByText('Needs more information')).toBeInTheDocument();
      // Date should be formatted as locale date
      expect(screen.getByText('1/16/2024')).toBeInTheDocument();
    });

    it('should handle multiple approval history entries', () => {
      // Requirements: 10.3
      const reportWithMultipleHistory = {
        ...mockReportData,
        approvalHistory: [
          {
            action: 'declined' as const,
            actionBy: 'Manager A',
            actionAt: '2024-01-15T10:30:00Z',
            comments: 'Initial decline'
          },
          {
            action: 'approved' as const,
            actionBy: 'Manager B',
            actionAt: '2024-01-16T14:20:00Z',
            comments: 'Approved after revision'
          }
        ]
      };

      const propsWithMultipleHistory = {
        ...mockProps,
        reportData: reportWithMultipleHistory
      };

      render(<ReportDetailsModal {...propsWithMultipleHistory} />);

      expect(screen.getByText('Declined')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('By: Manager A')).toBeInTheDocument();
      expect(screen.getByText('By: Manager B')).toBeInTheDocument();
      expect(screen.getByText('Initial decline')).toBeInTheDocument();
      expect(screen.getByText('Approved after revision')).toBeInTheDocument();
    });
  });
});
