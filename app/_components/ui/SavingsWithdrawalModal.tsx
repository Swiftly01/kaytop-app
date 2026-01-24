'use client';

import { useState } from 'react';
import { savingsService } from '@/lib/services/savings';
import { useToast } from '@/app/hooks/useToast';
import type { WithdrawalData } from '@/lib/api/types';

interface SavingsWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  currentBalance: number;
  onSuccess?: () => void;
}

export default function SavingsWithdrawalModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  currentBalance,
  onSuccess
}: SavingsWithdrawalModalProps) {
  const [formData, setFormData] = useState<WithdrawalData>({
    amount: 0,
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      error('Please enter a valid withdrawal amount');
      return;
    }

    if (formData.amount > currentBalance) {
      error('Withdrawal amount cannot exceed current balance');
      return;
    }

    if (!formData.description.trim()) {
      error('Please provide a description for the withdrawal');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await savingsService.recordWithdrawal(customerId, formData);
      
      success(`Withdrawal of ₦${formData.amount.toLocaleString()} recorded successfully for ${customerName}`);
      
      // Reset form
      setFormData({
        amount: 0,
        description: ''
      });
      
      onSuccess?.();
      onClose();
      
    } catch (err) {
      console.error('Withdrawal recording error:', err);
      error(err instanceof Error ? err.message : 'Failed to record withdrawal');
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
              Record Savings Withdrawal
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#475467]">
              Record a new savings withdrawal for {customerName}
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
                Current Balance
              </p>
              <p className="text-[20px] font-semibold text-[#101828]">
                ₦{currentBalance.toLocaleString()}
              </p>
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                Withdrawal Amount (₦) *
              </label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter withdrawal amount"
                min="1"
                max={currentBalance}
                step="0.01"
                required
                className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
              {formData.amount > currentBalance && (
                <p className="text-[12px] text-[#F04438] mt-1">
                  Amount cannot exceed current balance
                </p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description for this withdrawal"
                rows={3}
                required
                className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all resize-none"
              />
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
              disabled={isSubmitting || formData.amount > currentBalance}
            >
              {isSubmitting ? 'Recording...' : 'Record Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
