/**
 * ActiveLoanCard Component
 * Display active loan information with progress bar
 */

'use client';

import { useState } from 'react';
import ProgressBar from './ProgressBar';
import PaymentScheduleModal, { Payment } from './PaymentScheduleModal';

interface ActiveLoanCardProps {
  loanId: string;
  amount: number;
  outstanding: number;
  monthlyPayment: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  paymentSchedule?: Payment[]; // Optional payment schedule data
}

export default function ActiveLoanCard({
  loanId,
  amount,
  outstanding,
  monthlyPayment,
  interestRate,
  startDate,
  endDate,
  paymentSchedule = []
}: ActiveLoanCardProps) {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate progress percentage
  const progressPercentage = ((amount - outstanding) / amount) * 100;

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const loanFields = [
    { label: 'Loan ID', value: loanId },
    { label: 'Amount', value: formatCurrency(amount) },
    { label: 'Outstanding', value: formatCurrency(outstanding) },
    { label: 'Monthly Payment', value: formatCurrency(monthlyPayment) },
    { label: 'Interest Rate', value: `${interestRate.toFixed(1)}%` },
    { label: 'Start Date', value: startDate },
    { label: 'End Date', value: endDate }
  ];

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #EAECF0',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '1126px'
      }}
    >
      {/* Title */}
      <h3
        className="text-lg font-semibold mb-6"
        style={{ color: '#101828' }}
      >
        Active Loan
      </h3>

      {/* Loan Fields */}
      <div className="grid grid-cols-4 gap-x-12 gap-y-6 mb-8">
        {loanFields.map((field, index) => (
          <div key={index}>
            <p
              className="text-sm font-normal mb-1"
              style={{ color: '#7C8FAC' }}
            >
              {field.label}
            </p>
            <p
              className="text-base font-normal"
              style={{ color: '#1E3146' }}
            >
              {field.value}
            </p>
          </div>
        ))}
      </div>

      {/* Repayment Progress */}
      <div className="mb-6">
        <ProgressBar
          percentage={progressPercentage}
          label="Repayment Progress"
          showPercentage={true}
        />
      </div>

      {/* View Payment Schedule Link */}
      <a
        href="#"
        className="inline-block text-sm font-semibold underline"
        style={{ color: '#6941C6' }}
        onClick={(e) => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
      >
        View Payment Schedule
      </a>

      {/* Payment Schedule Modal */}
      <PaymentScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payments={paymentSchedule}
        loanId={loanId}
      />
    </div>
  );
}
