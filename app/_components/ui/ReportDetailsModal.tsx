'use client';

import { useEffect, useRef } from 'react';

/**
 * Data structure for report details
 */
export interface ReportDetailsData {
  /** Unique identifier for the report (e.g., "ID: 43756") */
  reportId: string;
  /** Name of the credit officer responsible */
  creditOfficer: string;
  /** Branch name where the report was submitted */
  branch: string;
  /** Email address where report was sent */
  email: string;
  /** Date the report was sent (pre-formatted, e.g., "Dec 30, 2022") */
  dateSent: string;
  /** Time the report was sent (pre-formatted, e.g., "14:30") */
  timeSent: string;
  /** Report type (e.g., "Daily Report", "Weekly Report") */
  reportType?: string;
  /** Report status */
  status?: 'submitted' | 'pending' | 'approved' | 'declined';
  /** Whether the report has been approved and is locked */
  isApproved?: boolean;
  /** Number of loans disbursed in this report */
  loansDispursed?: number;
  /** Total monetary value of loans disbursed (pre-formatted, e.g., "₦300,000") */
  loansValueDispursed?: string;
  /** Total savings collected (pre-formatted, e.g., "₦300,000") */
  savingsCollected?: string;
  /** Number of repayments collected */
  repaymentsCollected?: number;
  /** Approval history for the report */
  approvalHistory?: Array<{
    action: 'approved' | 'declined';
    actionBy: string;
    actionAt: string;
    comments?: string;
  }>;
}

/**
 * Props for the ReportDetailsModal component
 */
export interface ReportDetailsModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback function when modal is closed */
  onClose: () => void;
  /** Report data to display */
  reportData: ReportDetailsData;
  /** Callback function when Approve button is clicked */
  onApprove: () => void;
  /** Callback function when Decline button is clicked */
  onDecline: () => void;
}

/**
 * Report Details Modal Component
 * 
 * Displays comprehensive report information in a right-aligned panel overlay.
 * Includes approve and decline action buttons.
 */
export function ReportDetailsModal({
  isOpen,
  onClose,
  reportData,
  onApprove,
  onDecline,
}: ReportDetailsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

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
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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

  // Conditional rendering - don't render if not open
  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };



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
        className="relative bg-white h-full w-full md:w-[688px] overflow-y-auto"
        style={{ borderRadius: '16px 0 0 16px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content Container with padding */}
        <div className="p-6 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-5">
            <h2
              id="modal-title"
              className="text-[18px] font-semibold leading-[28px] text-[#021C3E]"
              style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
            >
              Report Details
            </h2>
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

          {/* Top Information Grid - 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            {/* Report ID */}
            <div className="flex flex-col gap-1">
              <p
                className="text-[16px] font-medium leading-[24px] text-[#464A53]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                Report ID
              </p>
              <p
                className="text-[16px] font-bold leading-[24px] text-[#021C3E]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                {reportData.reportId || 'N/A'}
              </p>
            </div>

            {/* Credit Officer */}
            <div className="flex flex-col gap-1">
              <p
                className="text-[16px] font-medium leading-[24px] text-[#464A53]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                Credit Officer
              </p>
              <p
                className="text-[16px] font-bold leading-[24px] text-[#021C3E]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                {reportData.creditOfficer || 'N/A'}
              </p>
            </div>

            {/* Branch */}
            <div className="flex flex-col gap-1">
              <p
                className="text-[16px] font-medium leading-[24px] text-[#464A53]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                Branch
              </p>
              <p
                className="text-[16px] font-bold leading-[24px] text-[#021C3E]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                {reportData.branch || 'Report Overview'}
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div className="mb-5 flex-1">
            {/* Section Header */}
            <h3
              className="text-[20px] font-medium leading-[30px] text-[#021C3E] mb-5"
              style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
            >
              Details
            </h3>

            {/* Details Grid - 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              {/* Loans Disbursed */}
              {reportData.loansDispursed !== undefined && (
                <div className="flex flex-col gap-1">
                  <p
                    className="text-[16px] font-medium leading-[24px] text-[#464A53]"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  >
                    Loans Disbursed
                  </p>
                  <p
                    className="text-[19px] font-bold leading-[28px] text-[#021C3E]"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  >
                    {reportData.loansDispursed ?? 'N/A'}
                  </p>
                </div>
              )}

              {/* Loans Value Disbursed */}
              {reportData.loansValueDispursed && (
                <div className="flex flex-col gap-1">
                  <p
                    className="text-[16px] font-medium leading-[24px] text-[#464A53]"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  >
                    Loans Value Disbursed
                  </p>
                  <p
                    className="text-[19px] font-bold leading-[28px] text-[#021C3E]"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  >
                    {reportData.loansValueDispursed || 'N/A'}
                  </p>
                </div>
              )}

              {/* Savings Collected */}
              {reportData.savingsCollected && (
                <div className="flex flex-col gap-1">
                  <p
                    className="text-[16px] font-medium leading-[24px] text-[#464A53]"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  >
                    Savings Collected
                  </p>
                  <p
                    className="text-[19px] font-bold leading-[28px] text-[#021C3E]"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  >
                    {reportData.savingsCollected || 'N/A'}
                  </p>
                </div>
              )}

              {/* Repayments Collected */}
              {reportData.repaymentsCollected !== undefined && (
                <div className="flex flex-col gap-1">
                  <p
                    className="text-[16px] font-medium leading-[24px] text-[#464A53]"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  >
                    Repayments Collected
                  </p>
                  <p
                    className="text-[19px] font-bold leading-[28px] text-[#021C3E]"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                  >
                    {reportData.repaymentsCollected ?? 'N/A'}
                  </p>
                </div>
              )}

              {/* Date Sent */}
              <div className="flex flex-col gap-1">
                <p
                  className="text-[16px] font-medium leading-[24px] text-[#464A53]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Date Sent
                </p>
                <p
                  className="text-[16px] font-medium leading-[24px] text-[#021C3E]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {reportData.dateSent || 'N/A'}
                </p>
              </div>

              {/* Time Sent */}
              <div className="flex flex-col gap-1">
                <p
                  className="text-[16px] font-medium leading-[24px] text-[#464A53]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Time Sent
                </p>
                <p
                  className="text-[16px] font-medium leading-[24px] text-[#021C3E]"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  {reportData.timeSent || 'N/A'}
                </p>
              </div>
            </div>

            {/* Approval History Section */}
            {reportData.approvalHistory && reportData.approvalHistory.length > 0 && (
              <div className="mb-5">
                <h4
                  className="text-[18px] font-medium leading-[28px] text-[#021C3E] mb-3"
                  style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                >
                  Approval History
                </h4>
                <div className="space-y-3">
                  {reportData.approvalHistory.map((historyItem, index) => (
                    <div
                      key={index}
                      className="p-3 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-[14px] font-semibold leading-[20px] ${
                            historyItem.action === 'approved' ? 'text-[#027A48]' : 'text-[#B42318]'
                          }`}
                          style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                        >
                          {historyItem.action === 'approved' ? 'Approved' : 'Declined'}
                        </span>
                        <span
                          className="text-[14px] font-medium leading-[20px] text-[#464A53]"
                          style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                        >
                          {new Date(historyItem.actionAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p
                        className="text-[14px] font-medium leading-[20px] text-[#021C3E] mb-1"
                        style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                      >
                        By: {historyItem.actionBy}
                      </p>
                      {historyItem.comments && (
                        <p
                          className="text-[14px] leading-[20px] text-[#464A53]"
                          style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                        >
                          {historyItem.comments}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Report Status Display */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#344054]">Status:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                reportData.status === 'approved' ? 'bg-green-100 text-green-800' :
                reportData.status === 'declined' ? 'bg-red-100 text-red-800' :
                reportData.status === 'forwarded' || reportData.status === 'pending' || reportData.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {reportData.status === 'draft' ? 'Draft' :
                 reportData.status === 'forwarded' ? 'Forwarded to HQ' :
                 reportData.status === 'pending' ? 'Pending Review' :
                 reportData.status === 'submitted' ? 'Submitted' :
                 reportData.status === 'approved' ? 'Approved' :
                 reportData.status === 'declined' ? 'Declined' :
                 'Unknown'}
              </span>
            </div>
            
            {/* Status-specific messages */}
            {reportData.status === 'draft' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  This report is still in draft status. It must be forwarded by the Branch Manager before it can be reviewed by HQ.
                </p>
              </div>
            )}
            
            {reportData.status === 'approved' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  This report has been approved and is locked.
                </p>
              </div>
            )}
            
            {reportData.status === 'declined' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  This report has been declined.
                </p>
              </div>
            )}
          </div>

          {/* Legacy Approval Status Label - keeping for backward compatibility */}
          {reportData.isApproved && (
            <div className="mb-5">
              <div
                className="w-full px-4 py-3 text-[16px] font-semibold leading-[24px] text-[#021C3E] bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg text-center"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                Report approved and is locked
              </div>
            </div>
          )}

          {/* Action Buttons - Only show if not approved */}
          {!reportData.isApproved && reportData.status !== 'approved' && (
            <div className="flex flex-col gap-3">
              {/* Check if report can be reviewed */}
              {(reportData.status === 'forwarded' || reportData.status === 'pending' || reportData.status === 'submitted') ? (
                <>
                  {/* Approve Button */}
                  <button
                    onClick={onApprove}
                    className="w-full px-4 py-3 text-[16px] font-semibold leading-[24px] text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                    aria-label="Approve report"
                  >
                    Approve
                  </button>

                  {/* Decline Button */}
                  <button
                    onClick={onDecline}
                    className="w-full px-4 py-3 text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                    aria-label="Decline report"
                  >
                    Decline
                  </button>
                </>
              ) : (
                /* Disabled buttons with explanation */
                <div className="flex flex-col gap-3">
                  <button
                    disabled
                    className="w-full px-4 py-3 text-[16px] font-semibold leading-[24px] text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                    aria-label="Approve report (disabled)"
                  >
                    Approve
                  </button>

                  <button
                    disabled
                    className="w-full px-4 py-3 text-[16px] font-semibold leading-[24px] text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                    style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
                    aria-label="Decline report (disabled)"
                  >
                    Decline
                  </button>
                  
                  <p className="text-sm text-gray-600 text-center mt-2">
                    {reportData.status === 'draft' 
                      ? 'Report must be forwarded by Branch Manager first'
                      : reportData.status === 'declined'
                      ? 'Report has already been declined'
                      : 'Report cannot be reviewed in current status'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportDetailsModal;
