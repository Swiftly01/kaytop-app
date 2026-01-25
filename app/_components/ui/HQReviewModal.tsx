'use client';

import { useEffect, useRef, useState } from 'react';
import type { BranchReport } from '@/lib/api/types';

/**
 * Data structure for HQ review modal
 */
export interface HQReviewModalData {
  /** Branch report data */
  branchReport: BranchReport;
  /** Individual reports within the branch */
  individualReports?: Array<{
    id: string;
    reportId: string;
    creditOfficer: string;
    status: 'submitted' | 'pending' | 'approved' | 'declined';
    dateSent: string;
    loansDispursed: number;
    loansValueDispursed: string;
    savingsCollected: string;
    repaymentsCollected: number;
  }>;
}

/**
 * Props for the HQReviewModal component
 */
export interface HQReviewModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback function when modal is closed */
  onClose: () => void;
  /** Branch report data to display */
  reviewData: HQReviewModalData;
  /** Callback function when Approve button is clicked */
  onApprove: (remarks?: string) => void;
  /** Callback function when Reject button is clicked */
  onReject: (reason: string) => void;
  /** Loading state for actions */
  loading?: boolean;
}

/**
 * HQ Review Modal Component
 * 
 * Displays comprehensive branch report information for HQ managers to review.
 * Includes approve and reject action buttons with confirmation dialogs.
 */
export function HQReviewModal({
  isOpen,
  onClose,
  reviewData,
  onApprove,
  onReject,
  loading = false,
}: HQReviewModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  
  // Action confirmation states
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Store the element that triggered the modal
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Handle Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showApproveConfirm || showRejectConfirm) {
          setShowApproveConfirm(false);
          setShowRejectConfirm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, showApproveConfirm, showRejectConfirm]);

  // Set initial focus and restore focus on close
  useEffect(() => {
    if (isOpen) {
      // Set focus to close button when modal opens
      closeButtonRef.current?.focus();
    } else {
      // Restore focus to triggering element when modal closes
      triggerElementRef.current?.focus();
    }
  }, [isOpen]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowApproveConfirm(false);
      setShowRejectConfirm(false);
      setApprovalRemarks('');
      setRejectionReason('');
    }
  }, [isOpen]);

  // Conditional rendering - don't render if not open
  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleApproveClick = () => {
    setShowApproveConfirm(true);
  };

  const handleRejectClick = () => {
    setShowRejectConfirm(true);
  };

  const handleConfirmApprove = () => {
    onApprove(approvalRemarks || undefined);
    setShowApproveConfirm(false);
  };

  const handleConfirmReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason.trim());
      setShowRejectConfirm(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: BranchReport['status']) => {
    const statusConfig = {
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Approved'
      },
      declined: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Declined'
      },
      mixed: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Mixed'
      },
      pending: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Pending Review'
      }
    };

    const config = statusConfig[status];
    
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const { branchReport, individualReports } = reviewData;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-[rgba(52,64,84,0.7)] backdrop-blur-[16px]"
        aria-hidden="true"
      />

      {/* Modal Panel - Right-aligned */}
      <div
        className="relative bg-white h-full w-full md:w-[720px] overflow-y-auto"
        style={{ borderRadius: '16px 0 0 16px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content Container with padding */}
        <div className="p-6 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                id="modal-title"
                className="text-[20px] font-semibold leading-[30px] text-[#021C3E]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                HQ Review - {branchReport.branchName}
              </h2>
              <p
                className="text-[14px] leading-[20px] text-[#464A53] mt-1"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                Review branch aggregate reports and individual submissions
              </p>
            </div>
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 text-[#667085] hover:text-[#344054] hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
              aria-label="Close modal"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="15" y1="5" x2="5" y2="15" />
                <line x1="5" y1="5" x2="15" y2="15" />
              </svg>
            </button>
          </div>

          {/* Branch Overview Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-[18px] font-medium leading-[28px] text-[#021C3E]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                Branch Overview
              </h3>
              {getStatusBadge(branchReport.status)}
            </div>

            {/* Branch Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="p-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg">
                <p
                  className="text-[12px] font-medium leading-[18px] text-[#464A53] mb-1"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Total Reports
                </p>
                <p
                  className="text-[20px] font-bold leading-[30px] text-[#021C3E]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {branchReport.reportCount}
                </p>
              </div>

              <div className="p-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg">
                <p
                  className="text-[12px] font-medium leading-[18px] text-[#464A53] mb-1"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Credit Officers
                </p>
                <p
                  className="text-[20px] font-bold leading-[30px] text-[#021C3E]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {branchReport.creditOfficerCount}
                </p>
              </div>

              <div className="p-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg">
                <p
                  className="text-[12px] font-medium leading-[18px] text-[#464A53] mb-1"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Pending
                </p>
                <p
                  className="text-[20px] font-bold leading-[30px] text-[#F79009]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {branchReport.pendingReports}
                </p>
              </div>

              <div className="p-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg">
                <p
                  className="text-[12px] font-medium leading-[18px] text-[#464A53] mb-1"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Approved
                </p>
                <p
                  className="text-[20px] font-bold leading-[30px] text-[#027A48]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {branchReport.approvedReports}
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-[#E4E7EC] rounded-lg">
                <p
                  className="text-[14px] font-medium leading-[20px] text-[#464A53] mb-2"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Total Savings
                </p>
                <p
                  className="text-[24px] font-bold leading-[32px] text-[#021C3E]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {formatCurrency(branchReport.totalSavings)}
                </p>
              </div>

              <div className="p-4 bg-white border border-[#E4E7EC] rounded-lg">
                <p
                  className="text-[14px] font-medium leading-[20px] text-[#464A53] mb-2"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Total Disbursed
                </p>
                <p
                  className="text-[24px] font-bold leading-[32px] text-[#021C3E]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {formatCurrency(branchReport.totalDisbursed)}
                </p>
              </div>

              <div className="p-4 bg-white border border-[#E4E7EC] rounded-lg">
                <p
                  className="text-[14px] font-medium leading-[20px] text-[#464A53] mb-2"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Total Repaid
                </p>
                <p
                  className="text-[24px] font-bold leading-[32px] text-[#021C3E]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {formatCurrency(branchReport.totalRepaid)}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Reports Section */}
          {individualReports && individualReports.length > 0 && (
            <div className="mb-6 flex-1">
              <h3
                className="text-[18px] font-medium leading-[28px] text-[#021C3E] mb-4"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                Individual Reports ({individualReports.length})
              </h3>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {individualReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p
                          className="text-[14px] font-semibold leading-[20px] text-[#021C3E]"
                          style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                        >
                          {report.reportId}
                        </p>
                        <p
                          className="text-[12px] leading-[18px] text-[#464A53]"
                          style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                        >
                          {report.creditOfficer} • {report.dateSent}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[#464A53]">Loans: </span>
                        <span className="font-medium text-[#021C3E]">{report.loansDispursed}</span>
                      </div>
                      <div>
                        <span className="text-[#464A53]">Value: </span>
                        <span className="font-medium text-[#021C3E]">{report.loansValueDispursed}</span>
                      </div>
                      <div>
                        <span className="text-[#464A53]">Savings: </span>
                        <span className="font-medium text-[#021C3E]">{report.savingsCollected}</span>
                      </div>
                      <div>
                        <span className="text-[#464A53]">Repayments: </span>
                        <span className="font-medium text-[#021C3E]">{report.repaymentsCollected}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons - Only show if status is pending or mixed */}
          {(branchReport.status === 'pending' || branchReport.status === 'mixed') && !showApproveConfirm && !showRejectConfirm && (
            <div className="flex flex-col gap-3">
              {/* Approve Button */}
              <button
                onClick={handleApproveClick}
                disabled={loading}
                className="w-full px-4 py-3 text-[16px] font-semibold leading-[24px] text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                aria-label="Approve branch reports"
              >
                {loading ? 'Processing...' : 'Approve Branch Reports'}
              </button>

              {/* Reject Button */}
              <button
                onClick={handleRejectClick}
                disabled={loading}
                className="w-full px-4 py-3 text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                aria-label="Reject branch reports"
              >
                {loading ? 'Processing...' : 'Reject Branch Reports'}
              </button>
            </div>
          )}

          {/* Approve Confirmation */}
          {showApproveConfirm && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                <h4
                  className="text-[16px] font-semibold leading-[24px] text-[#027A48] mb-2"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Confirm Approval
                </h4>
                <p
                  className="text-[14px] leading-[20px] text-[#15803D] mb-3"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Are you sure you want to approve all reports from {branchReport.branchName}?
                </p>
                <div className="mb-3">
                  <label
                    htmlFor="approval-remarks"
                    className="block text-[14px] font-medium leading-[20px] text-[#027A48] mb-2"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  >
                    Remarks (Optional)
                  </label>
                  <textarea
                    id="approval-remarks"
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    placeholder="Add any remarks for this approval..."
                    className="w-full px-3 py-2 text-[14px] border border-[#BBF7D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#027A48] focus:border-[#027A48]"
                    rows={3}
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmApprove}
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-[16px] font-semibold leading-[24px] text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {loading ? 'Approving...' : 'Confirm Approval'}
                </button>
                <button
                  onClick={() => setShowApproveConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reject Confirmation */}
          {showRejectConfirm && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
                <h4
                  className="text-[16px] font-semibold leading-[24px] text-[#B42318] mb-2"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Confirm Rejection
                </h4>
                <p
                  className="text-[14px] leading-[20px] text-[#DC2626] mb-3"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Are you sure you want to reject reports from {branchReport.branchName}?
                </p>
                <div className="mb-3">
                  <label
                    htmlFor="rejection-reason"
                    className="block text-[14px] font-medium leading-[20px] text-[#B42318] mb-2"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  >
                    Reason for Rejection *
                  </label>
                  <textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting these reports..."
                    className="w-full px-3 py-2 text-[14px] border border-[#FECACA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B42318] focus:border-[#B42318]"
                    rows={3}
                    required
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmReject}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 px-4 py-3 text-[16px] font-semibold leading-[24px] text-white bg-[#D92D20] rounded-lg hover:bg-[#B42318] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D92D20] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {loading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => setShowRejectConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Already Reviewed Status */}
          {branchReport.status === 'approved' && (
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-center">
              <p
                className="text-[16px] font-semibold leading-[24px] text-[#027A48]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                ✓ Branch reports have been approved
              </p>
            </div>
          )}

          {branchReport.status === 'declined' && (
            <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-center">
              <p
                className="text-[16px] font-semibold leading-[24px] text-[#B42318]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                ✗ Branch reports have been rejected
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HQReviewModal;