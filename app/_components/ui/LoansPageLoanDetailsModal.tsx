'use client';

import React, { useEffect, useRef } from 'react';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatDate } from '@/lib/formatDate';
import StatusBadge from './StatusBadge';

// TypeScript interfaces
export interface LoanDetailsData {
  id: string;
  loanId: string;
  borrowerName: string;
  borrowerPhone: string;
  status: 'Active' | 'Scheduled' | 'Missed Payment';
  amount: number;
  interestRate: number;
  nextRepaymentDate: Date;
  disbursementDate: Date;
  creditOfficer: string;
  branch: string;
  missedPayments?: number;
}

export interface LoansPageLoanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanData: LoanDetailsData;
  onEdit: (loanData: LoanDetailsData) => void;
  onDelete: (loanId: string) => void;
  onViewSchedule: (loanId: string) => void;
}

export default function LoansPageLoanDetailsModal({
  isOpen,
  onClose,
  loanData,
  onEdit,
  onDelete,
  onViewSchedule,
}: LoansPageLoanDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key press
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

  // Handle focus management and body scroll
  useEffect(() => {
    if (!isOpen) return;

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Set initial focus to close button
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Cleanup: restore focus and scroll
    return () => {
      document.body.style.overflow = '';
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Conditional rendering based on isOpen prop
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-[rgba(52,64,84,0.7)] backdrop-blur-[16px]"
        style={{ zIndex: 50 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed right-0 top-0 h-full bg-white overflow-y-auto max-md:w-full max-md:rounded-none"
        style={{
          width: '688px',
          borderRadius: '16px 0 0 16px',
          zIndex: 51,
          padding: '24px',
          fontFamily: 'Open Sauce Sans, sans-serif',
        }}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h2
            id="modal-title"
            style={{
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '28px',
              color: '#021C3E',
              fontFamily: 'Open Sauce Sans, sans-serif',
            }}
          >
            Loan Details
          </h2>

          {/* Action buttons group */}
          <div className="flex items-center" style={{ gap: '8px' }}>
            {/* Export button */}
            <button
              onClick={() => {
                try {
                  // Create CSV content
                  const csvContent = [
                    ['Field', 'Value'],
                    ['Loan ID', loanData.loanId],
                    ['Borrower Name', loanData.borrowerName],
                    ['Phone Number', loanData.borrowerPhone],
                    ['Loan Amount', formatCurrency(loanData.amount)],
                    ['Interest Rate', `${loanData.interestRate}%`],
                    ['Status', loanData.status],
                    ['Disbursement Date', formatDate(loanData.disbursementDate)],
                    ['Next Repayment Date', formatDate(loanData.nextRepaymentDate)],
                    ['Credit Officer', loanData.creditOfficer],
                    ['Branch', loanData.branch],
                  ]
                    .map((row) => row.join(','))
                    .join('\n');

                  // Create and download file
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `loan-${loanData.loanId}-details.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Export failed:', error);
                }
              }}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label="Export to CSV"
              title="Export to CSV"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5 12.5V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V12.5M14.1667 8.33333L10 12.5M10 12.5L5.83333 8.33333M10 12.5V2.5"
                  stroke="#475467"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Print button */}
            <button
              onClick={() => {
                try {
                  window.print();
                } catch (error) {
                  console.error('Print failed:', error);
                }
              }}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label="Print"
              title="Print"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 7.5V2.5H15V7.5M5 15H3.33333C2.89131 15 2.67029 15 2.50191 14.9183C2.35315 14.8465 2.23047 14.7238 2.15866 14.5751C2.07701 14.4067 2.07701 14.1857 2.07701 13.7437V10.2563C2.07701 9.81431 2.07701 9.59329 2.15866 9.42491C2.23047 9.27615 2.35315 9.15347 2.50191 9.08166C2.67029 9 2.89131 9 3.33333 9H16.6667C17.1087 9 17.3297 9 17.4981 9.08166C17.6468 9.15347 17.7695 9.27615 17.8413 9.42491C17.923 9.59329 17.923 9.81431 17.923 10.2563V13.7437C17.923 14.1857 17.923 14.4067 17.8413 14.5751C17.7695 14.7238 17.6468 14.8465 17.4981 14.9183C17.3297 15 17.1087 15 16.6667 15H15M15 12.5H5V17.5H15V12.5Z"
                  stroke="#475467"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close modal"
              title="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="#475467"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Borrower Information Section */}
        <div style={{ marginBottom: '32px' }}>
          {/* Borrower Name */}
          <h3
            style={{
              fontSize: '24px',
              fontWeight: 700,
              lineHeight: '32px',
              color: '#021C3E',
              fontFamily: 'Open Sauce Sans, sans-serif',
              marginBottom: '8px',
            }}
          >
            {loanData.borrowerName || 'N/A'}
          </h3>

          {/* Phone Number */}
          <p
            style={{
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '24px',
              color: '#475467',
              fontFamily: 'Open Sauce Sans, sans-serif',
              marginBottom: '12px',
            }}
          >
            {loanData.borrowerPhone || 'N/A'}
          </p>

          {/* Loan ID Badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              backgroundColor: '#F9FAFB',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '20px',
              color: '#667085',
              fontFamily: 'Open Sauce Sans, sans-serif',
            }}
          >
            Loan ID: {loanData.loanId || 'N/A'}
          </div>
        </div>

        {/* Loan Details Grid Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {/* Loan Amount */}
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#464A53',
                fontFamily: 'Open Sauce Sans, sans-serif',
                marginBottom: '4px',
              }}
            >
              Loan Amount
            </div>
            <div
              style={{
                fontSize: '19px',
                fontWeight: 700,
                lineHeight: '28px',
                color: '#021C3E',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              {loanData.amount ? formatCurrency(loanData.amount) : 'N/A'}
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#464A53',
                fontFamily: 'Open Sauce Sans, sans-serif',
                marginBottom: '4px',
              }}
            >
              Interest Rate
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#021C3E',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              {loanData.interestRate ? `${loanData.interestRate}%` : 'N/A'}
            </div>
          </div>

          {/* Status */}
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#464A53',
                fontFamily: 'Open Sauce Sans, sans-serif',
                marginBottom: '4px',
              }}
            >
              Status
            </div>
            <div>
              <StatusBadge status={loanData.status} />
            </div>
          </div>

          {/* Disbursement Date */}
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#464A53',
                fontFamily: 'Open Sauce Sans, sans-serif',
                marginBottom: '4px',
              }}
            >
              Disbursement Date
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#021C3E',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              {loanData.disbursementDate
                ? formatDate(loanData.disbursementDate)
                : 'N/A'}
            </div>
          </div>

          {/* Next Repayment Date */}
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#464A53',
                fontFamily: 'Open Sauce Sans, sans-serif',
                marginBottom: '4px',
              }}
            >
              Next Repayment Date
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#021C3E',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              {loanData.nextRepaymentDate
                ? formatDate(loanData.nextRepaymentDate)
                : 'N/A'}
            </div>
          </div>

          {/* Credit Officer */}
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#464A53',
                fontFamily: 'Open Sauce Sans, sans-serif',
                marginBottom: '4px',
              }}
            >
              Credit Officer
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#021C3E',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              {loanData.creditOfficer || 'N/A'}
            </div>
          </div>

          {/* Branch */}
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#464A53',
                fontFamily: 'Open Sauce Sans, sans-serif',
                marginBottom: '4px',
              }}
            >
              Branch
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#021C3E',
                fontFamily: 'Open Sauce Sans, sans-serif',
              }}
            >
              {loanData.branch || 'N/A'}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* View Schedule Button - Primary */}
          <button
            onClick={() => onViewSchedule(loanData.loanId)}
            className="w-full hover:opacity-90 transition-opacity"
            style={{
              padding: '10px 18px',
              backgroundColor: '#7F56D9',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px',
              fontFamily: 'Open Sauce Sans, sans-serif',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="View payment schedule"
          >
            View Schedule
          </button>

          {/* Edit Loan Button - Secondary */}
          <button
            onClick={() => onEdit(loanData)}
            className="w-full hover:bg-gray-50 transition-colors"
            style={{
              padding: '10px 18px',
              backgroundColor: '#FFFFFF',
              color: '#344054',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px',
              fontFamily: 'Open Sauce Sans, sans-serif',
              borderRadius: '8px',
              border: '1px solid #D0D5DD',
              cursor: 'pointer',
            }}
            aria-label="Edit loan details"
          >
            Edit Loan
          </button>

          {/* Delete Loan Button - Danger */}
          <button
            onClick={() => onDelete(loanData.loanId)}
            className="w-full hover:opacity-90 transition-opacity"
            style={{
              padding: '10px 18px',
              backgroundColor: '#E43535',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px',
              fontFamily: 'Open Sauce Sans, sans-serif',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Delete loan"
          >
            Delete Loan
          </button>
        </div>
      </div>
    </>
  );
}
