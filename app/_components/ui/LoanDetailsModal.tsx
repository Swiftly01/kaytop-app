'use client';

import { useEffect, useRef } from 'react';

/**
 * Data structure for loan report details
 */
export interface LoanDetailsData {
  /** Unique identifier for the loan report (e.g., "BN-B1E73DA–0017") */
  reportId: string;
  /** Name of the credit officer responsible */
  creditOfficer: string;
  /** Branch name where the loan was processed */
  branch: string;
  /** Number of loans disbursed */
  loansDispursed: number;
  /** Total monetary value of loans disbursed (pre-formatted, e.g., "₦2,500,000") */
  loansValueDispursed: string;
  /** Total savings collected (pre-formatted, e.g., "₦450,000") */
  savingsCollected: string;
  /** Number of repayments collected */
  repaymentsCollected: number;
  /** Date the report was sent (pre-formatted, e.g., "Jan 15, 2025") */
  dateSent: string;
  /** Time the report was sent (pre-formatted, e.g., "2:30 PM") */
  timeSent: string;
}

/**
 * Props for the LoanDetailsModal component
 */
export interface LoanDetailsModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback function when modal is closed */
  onClose: () => void;
  /** Loan report data to display */
  loanData: LoanDetailsData;
  /** Callback function when Approve button is clicked */
  onApprove: () => void;
  /** Callback function when Decline button is clicked */
  onDecline: () => void;
}

/**
 * Loan Details Modal Component
 * 
 * Displays comprehensive loan report information in a right-aligned panel overlay.
 * Includes approve and decline action buttons.
 */
export function LoanDetailsModal({
  isOpen,
  onClose,
  loanData,
  onApprove,
  onDecline,
}: LoanDetailsModalProps) {
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
        className="absolute inset-0 bg-[rgba(52,64,84,0.7)] backdrop-blur-[8px]"
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
              Loan Details
            </h2>
            <div className="flex items-center gap-2">
              {/* Export Button */}
              <button
                onClick={() => {
                  const { exportLoanDetailsToCSV } = require('@/lib/exportUtils');
                  exportLoanDetailsToCSV(loanData);
                }}
                className="p-2 text-[#667085] hover:text-[#344054] hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
                aria-label="Export to CSV"
                title="Export to CSV"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M17.5 12.5V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V12.5M14.1667 8.33333L10 12.5M10 12.5L5.83333 8.33333M10 12.5V2.5"
                    stroke="currentColor"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Print Button */}
              <button
                onClick={() => {
                  const { printLoanDetails } = require('@/lib/exportUtils');
                  printLoanDetails(loanData);
                }}
                className="p-2 text-[#667085] hover:text-[#344054] hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
                aria-label="Print"
                title="Print"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 7.5V2.5H15V7.5M5 15H3.33333C2.89131 15 2.67029 15 2.50191 14.9183C2.35315 14.8465 2.23047 14.7238 2.15866 14.5751C2.07701 14.4067 2.07701 14.1857 2.07701 13.7437V10.2563C2.07701 9.81428 2.07701 9.59327 2.15866 9.42489C2.23047 9.27613 2.35315 9.15345 2.50191 9.08164C2.67029 9 2.89131 9 3.33333 9H16.6667C17.1087 9 17.3297 9 17.4981 9.08164C17.6468 9.15345 17.7695 9.27613 17.8413 9.42489C17.923 9.59327 17.923 9.81428 17.923 10.2563V13.7437C17.923 14.1857 17.923 14.4067 17.8413 14.5751C17.7695 14.7238 17.6468 14.8465 17.4981 14.9183C17.3297 15 17.1087 15 16.6667 15H15M15 12.5H5V17.5H15V12.5Z"
                    stroke="currentColor"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

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
                className="text-[16px] font-medium leading-[24px] text-[#021C3E]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                {loanData.reportId || 'N/A'}
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
                className="text-[16px] font-medium leading-[24px] text-[#021C3E]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                {loanData.creditOfficer || 'N/A'}
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
                className="text-[16px] font-medium leading-[24px] text-[#021C3E]"
                style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              >
                {loanData.branch || 'N/A'}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Loans Disbursed */}
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
                  {loanData.loansDispursed ?? 'N/A'}
                </p>
              </div>

              {/* Loans Value Disbursed */}
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
                  {loanData.loansValueDispursed || 'N/A'}
                </p>
              </div>

              {/* Savings Collected */}
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
                  {loanData.savingsCollected || 'N/A'}
                </p>
              </div>

              {/* Repayments Collected */}
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
                  {loanData.repaymentsCollected ?? 'N/A'}
                </p>
              </div>

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
                  {loanData.dateSent || 'N/A'}
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
                  {loanData.timeSent || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Approve Button */}
            <button
              onClick={onApprove}
              className="w-full px-4 py-3 text-[16px] font-semibold leading-[24px] text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
              style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              aria-label="Approve loan report"
            >
              Approve
            </button>

            {/* Decline Button */}
            <button
              onClick={onDecline}
              className="w-full px-4 py-3 text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
              style={{ fontFamily: 'Open Sauce Sans, sans-serif' }}
              aria-label="Decline loan report"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
