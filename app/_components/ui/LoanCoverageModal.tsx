'use client';

import { useState, useEffect } from 'react';
import { savingsService } from '@/lib/services/savings';
import { loanService } from '@/lib/services/loans';
import { useToast } from '@/app/hooks/useToast';
import type { LoanCoverageData, Loan } from '@/lib/api/types';

interface LoanCoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  currentBalance: number;
  onSuccess?: () => void;
}

export default function LoanCoverageModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  currentBalance,
  onSuccess
}: LoanCoverageModalProps) {
  const [formData, setFormData] = useState<LoanCoverageData>({
    loanId: '',
    amount: 0
  });
  const [customerLoans, setCustomerLoans] = useState<Loan[]>([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  // Fetch customer loans when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCustomerLoans();
    }
  }, [isOpen, customerId]);

  const fetchCustomerLoans = async () => {
    try {
      setIsLoadingLoans(true);
      const loans = await loanService.getCustomerLoans(customerId);
      // Filter for active loans only
      const activeLoans = loans.filter(loan => 
        loan.status === 'active' || loan.status === 'disbursed'
      );
      setCustomerLoans(activeLoans);
    } catch (err) {
      console.error('Failed to fetch customer loans:', err);
      error('Failed to load customer loans');
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const selectedLoan = customerLoans.find(loan => loan.id === formData.loanId);
  const maxCoverageAmount = selectedLoan ? Math.min(currentBalance, selectedLoan.amount) : currentBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.loanId) {
      error('Please select a loan to cover');
      return;
    }

    if (formData.amount <= 0) {
      error('Please enter a valid coverage amount');
      return;
    }

    if (formData.amount > currentBalance) {
      error('Coverage amount cannot exceed current savings balance');
      return;
    }

    if (selectedLoan && formData.amount > selectedLoan.amount) {
      error('Coverage amount cannot exceed loan amount');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await savingsService.useSavingsForLoanCoverage(customerId, formData);
      
      success(`Loan coverage of ₦${formData.amount.toLocaleString()} applied successfully for ${customerName}`);
      
      // Reset form
      setFormData({
        loanId: '',
        amount: 0
      });
      
      onSuccess?.();
      onClose();
      
    } catch (err) {
      console.error('Loan coverage error:', err);
      error(err instanceof Error ? err.message : 'Failed to apply loan coverage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-[12px] w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow:
            '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-[#EAECF0]">
          <div className="pr-10">
            <h2 className="text-[18px] font-semibold leading-[28px] text-[#101828] mb-1">
              Use Savings for Loan Coverage
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#475467]">
              Apply savings balance to cover loan payments for {customerName}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
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
                stroke="#667085"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6">
          <div className="space-y-5">
            {/* Current Balance Display */}
            <div className="p-4 bg-[#F9FAFB] border border-[#EAECF0] rounded-lg">
              <p className="text-[14px] font-medium text-[#344054] mb-1">
                Available Savings Balance
              </p>
              <p className="text-[20px] font-semibold text-[#101828]">
                ₦{currentBalance.toLocaleString()}
              </p>
            </div>

            {/* Loan Selection */}
            <div>
              <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                Select Loan *
              </label>
              {isLoadingLoans ? (
                <div className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#667085] bg-gray-50 border border-[#D0D5DD] rounded-lg">
                  Loading loans...
                </div>
              ) : customerLoans.length === 0 ? (
                <div className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#667085] bg-gray-50 border border-[#D0D5DD] rounded-lg">
                  No active loans found for this customer
                </div>
              ) : (
                <select
                  value={formData.loanId}
                  onChange={(e) => setFormData({ ...formData, loanId: e.target.value, amount: 0 })}
                  required
                  className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                >
                  <option value="">Select a loan</option>
                  {customerLoans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      Loan #{String(loan.id).slice(-8).toUpperCase()} - ₦{loan.amount.toLocaleString()} ({loan.status})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Loan Details */}
            {selectedLoan && (
              <div className="p-4 bg-[#F0F9FF] border border-[#B9E6FE] rounded-lg">
                <p className="text-[14px] font-medium text-[#0369A1] mb-2">
                  Selected Loan Details
                </p>
                <div className="space-y-1">
                  <p className="text-[12px] text-[#0369A1]">
                    <span className="font-medium">Amount:</span> ₦{selectedLoan.amount.toLocaleString()}
                  </p>
                  <p className="text-[12px] text-[#0369A1]">
                    <span className="font-medium">Interest Rate:</span> {selectedLoan.interestRate}%
                  </p>
                  <p className="text-[12px] text-[#0369A1]">
                    <span className="font-medium">Status:</span> {selectedLoan.status}
                  </p>
                </div>
              </div>
            )}

            {/* Coverage Amount Field */}
            <div>
              <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                Coverage Amount (₦) *
              </label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter coverage amount"
                min="1"
                max={maxCoverageAmount}
                step="0.01"
                required
                disabled={!formData.loanId}
                className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              {formData.loanId && (
                <p className="text-[12px] text-[#667085] mt-1">
                  Maximum coverage: ₦{maxCoverageAmount.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-white bg-[#7F56D9] border border-[#7F56D9] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !formData.loanId || customerLoans.length === 0}
            >
              {isSubmitting ? 'Applying...' : 'Apply Coverage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}