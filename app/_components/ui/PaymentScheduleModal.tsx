'use client';

import { useEffect, useCallback, useRef } from 'react';

// Utility function to format currency
function formatCurrency(amount: number): string {
  // Handle invalid amounts
  if (typeof amount !== 'number' || isNaN(amount)) {
    console.warn('Invalid amount provided to formatCurrency:', amount);
    return 'N/A';
  }
  return `₦${amount.toLocaleString('en-NG')}`;
}

// Utility function to format date
function formatDate(date: Date): string {
  // Handle invalid dates
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date provided to formatDate:', date);
    return 'Invalid Date';
  }
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${dayName} ${displayHours}:${displayMinutes}${ampm}`;
}

// Utility function to get status color
function getStatusColor(status: 'Paid' | 'Missed' | 'Upcoming'): string {
  switch (status) {
    case 'Paid':
      return '#039855'; // Green
    case 'Missed':
      return '#E91F11'; // Red
    case 'Upcoming':
      return '#475467'; // Gray
    default:
      console.warn('Unrecognized payment status:', status);
      return '#475467'; // Default to gray for unknown statuses
  }
}

// Utility function to normalize status
function normalizeStatus(status: string): 'Paid' | 'Missed' | 'Upcoming' {
  const validStatuses = ['Paid', 'Missed', 'Upcoming'];
  if (validStatuses.includes(status)) {
    return status as 'Paid' | 'Missed' | 'Upcoming';
  }
  console.warn('Invalid status provided, defaulting to Upcoming:', status);
  return 'Upcoming';
}

// Payment data interface
export interface Payment {
  id: string;
  paymentNumber: number;
  amount: number;
  status: 'Paid' | 'Missed' | 'Upcoming';
  dueDate: Date;
  isPaid: boolean;
}

// Component props interface
export interface PaymentScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: Payment[];
  loanId?: string;
  onPaymentToggle?: (paymentId: string) => void;
}

export default function PaymentScheduleModal({
  isOpen = false,
  onClose,
  payments = [],
  loanId,
  onPaymentToggle,
}: PaymentScheduleModalProps) {
  // Store reference to the element that triggered the modal
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Store the trigger element when modal opens
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Validate props
  useEffect(() => {
    if (isOpen && !onClose) {
      console.warn('PaymentScheduleModal: onClose callback is required but not provided');
    }
    if (isOpen && !Array.isArray(payments)) {
      console.warn('PaymentScheduleModal: payments prop should be an array');
    }
  }, [isOpen, onClose, payments]);

  // Handle Escape key press
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && onClose) {
        onClose();
        // Restore focus to trigger element
        setTimeout(() => {
          if (triggerElementRef.current) {
            triggerElementRef.current.focus();
          }
        }, 0);
      }
    },
    [isOpen, onClose]
  );

  // Add/remove escape key listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscapeKey]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const modalElement = document.querySelector('[role="dialog"]');
      if (!modalElement) return;

      const focusableElements = modalElement.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    // Set initial focus to close button
    const closeButton = document.querySelector('[aria-label="Close modal"]') as HTMLElement;
    if (closeButton) {
      closeButton.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
      // Restore focus to trigger element
      setTimeout(() => {
        if (triggerElementRef.current) {
          triggerElementRef.current.focus();
        }
      }, 0);
    }
  };

  // Handle close with focus restoration
  const handleClose = () => {
    if (onClose) {
      onClose();
      // Restore focus to trigger element
      setTimeout(() => {
        if (triggerElementRef.current) {
          triggerElementRef.current.focus();
        }
      }, 0);
    }
  };

  // Handle checkbox toggle with error handling
  const handleCheckboxToggle = (paymentId: string) => {
    try {
      if (onPaymentToggle) {
        onPaymentToggle(paymentId);
      }
    } catch (error) {
      console.error('Error toggling payment checkbox:', error);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      style={{
        background: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal Container */}
      <div
        className="h-full bg-white"
        style={{
          width: '688px',
          borderRadius: '16px 0 0 16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-12 py-10">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex h-6 w-6 items-center justify-center text-gray-900 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
            disabled={!onClose}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Title */}
          <h2
            id="modal-title"
            className="text-lg font-semibold text-black"
            style={{
              fontFamily: "'Open Sauce Sans', sans-serif",
              fontSize: '18px',
              lineHeight: '22px',
            }}
          >
            Payment Schedule
          </h2>

          {/* Spacer for alignment */}
          <div className="w-6" />
        </div>

        {/* Modal Content - Payment Schedule Table */}
        <div
          className="mx-auto overflow-hidden rounded-lg bg-white"
          style={{
            width: '585px',
            maxHeight: '764px',
          }}
        >
          {/* Table Container */}
          <div className="overflow-auto" style={{ maxHeight: '764px' }}>
            <table className="w-full">
              {/* Table Header */}
              <thead
                className="sticky top-0 bg-[#F9FAFB]"
                style={{
                  borderBottom: '1px solid #EAECF0',
                }}
              >
                <tr>
                  {/* Amount Column Header */}
                  <th
                    className="px-0 py-3 text-left"
                    style={{
                      width: '219px',
                      fontFamily: "'Open Sauce Sans', sans-serif",
                      fontSize: '12px',
                      fontWeight: 500,
                      lineHeight: '18px',
                      color: '#475467',
                    }}
                  >
                    Amount
                  </th>

                  {/* Status Column Header */}
                  <th
                    className="px-0 py-3 text-left"
                    style={{
                      width: '105px',
                      fontFamily: "'Open Sauce Sans', sans-serif",
                      fontSize: '12px',
                      fontWeight: 500,
                      lineHeight: '18px',
                      color: '#475467',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 3.33334V12.6667M8 12.6667L12.6667 8.00001M8 12.6667L3.33333 8.00001"
                          stroke="#475467"
                          strokeWidth="1.33333"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </th>

                  {/* Date Column Header */}
                  <th
                    className="px-6 py-3 text-left"
                    style={{
                      width: '185px',
                      fontFamily: "'Open Sauce Sans', sans-serif",
                      fontSize: '12px',
                      fontWeight: 500,
                      lineHeight: '18px',
                      color: '#475467',
                    }}
                  >
                    Date
                  </th>

                  {/* Checkbox Column Header */}
                  <th
                    className="px-4 py-3 text-left"
                    style={{
                      width: '76px',
                    }}
                  >
                    {/* Empty header for checkbox column */}
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No payment schedule available
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => {
                    // Validate payment data
                    if (!payment || !payment.id) {
                      console.warn('Invalid payment data:', payment);
                      return null;
                    }

                    const normalizedStatus = normalizeStatus(payment.status);

                    return (
                    <tr
                      key={payment.id}
                      style={{
                        borderBottom: '1px solid #EAECF0',
                      }}
                    >
                      {/* Amount Column */}
                      <td
                        className="py-4 pr-0"
                        style={{
                          width: '219px',
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          {/* Payment Number */}
                          <span
                            style={{
                              fontFamily: "'Open Sauce Sans', sans-serif",
                              fontSize: '14px',
                              fontWeight: 500,
                              lineHeight: '20px',
                              color: '#101828',
                            }}
                          >
                            Payment {payment.paymentNumber}
                          </span>
                          {/* Payment Amount */}
                          <span
                            style={{
                              fontFamily: "'Open Sauce Sans', sans-serif",
                              fontSize: '14px',
                              fontWeight: 400,
                              lineHeight: '20px',
                              color: normalizedStatus === 'Paid' ? '#039855' : '#475467',
                            }}
                          >
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td
                        className="py-4 pr-0"
                        style={{
                          width: '105px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Open Sauce Sans', sans-serif",
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '20px',
                            color: getStatusColor(normalizedStatus),
                          }}
                        >
                          {normalizedStatus}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td
                        className="px-6 py-4"
                        style={{
                          width: '185px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Open Sauce Sans', sans-serif",
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '20px',
                            color: '#475467',
                          }}
                        >
                          {formatDate(payment.dueDate)}
                        </span>
                      </td>

                      {/* Checkbox Column */}
                      <td
                        className="py-4 pl-4 pr-0"
                        style={{
                          width: '76px',
                        }}
                      >
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleCheckboxToggle(payment.id)}
                            className="flex h-5 w-5 items-center justify-center rounded-md cursor-pointer transition-colors hover:opacity-80"
                            style={{
                              backgroundColor: payment.isPaid ? '#F9F5FF' : '#FFFFFF',
                              border: `1px solid ${payment.isPaid ? '#7F56D9' : '#D0D5DD'}`,
                            }}
                            aria-label={`Mark payment ${payment.paymentNumber || 'unknown'} as ${payment.isPaid ? 'unpaid' : 'paid'}`}
                            aria-checked={payment.isPaid}
                            role="checkbox"
                            disabled={!onPaymentToggle}
                          >
                            {payment.isPaid && (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10 3L4.5 8.5L2 6"
                                  stroke="#7F56D9"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
