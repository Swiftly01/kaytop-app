'use client';

import { useState } from 'react';
import { savingsService } from '@/lib/services/savings';
import { useToast } from '@/app/hooks/useToast';
import type { Transaction } from '@/lib/api/types';

interface TransactionApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSuccess?: () => void;
}

export default function TransactionApprovalModal({
  isOpen,
  onClose,
  transaction,
  onSuccess
}: TransactionApprovalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleApprove = async () => {
    if (!transaction) return;

    try {
      setIsSubmitting(true);
      
      const approvalType = transaction.type === 'withdrawal' ? 'withdrawal' : 'loan-coverage';
      await savingsService.approveTransaction(transaction.id, approvalType);
      
      success(`${transaction.type === 'withdrawal' ? 'Withdrawal' : 'Loan coverage'} transaction approved successfully`);
      
      onSuccess?.();
      onClose();
      
    } catch (err) {
      console.error('Transaction approval error:', err);
      error(err instanceof Error ? err.message : 'Failed to approve transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !transaction) return null;

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'loan_coverage':
        return 'Loan Coverage';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-[#F79009] bg-[#FFFCF5] border-[#FEDF89]';
      case 'approved':
        return 'text-[#027A48] bg-[#ECFDF3] border-[#ABEFC6]';
      case 'rejected':
        return 'text-[#B42318] bg-[#FEF3F2] border-[#FECDCA]';
      default:
        return 'text-[#667085] bg-[#F9FAFB] border-[#EAECF0]';
    }
  };

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
              Approve Transaction
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#475467]">
              Review and approve the pending transaction
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
        <div className="px-6 pt-5 pb-6">
          <div className="space-y-5">
            {/* Transaction Details */}
            <div className="p-4 bg-[#F9FAFB] border border-[#EAECF0] rounded-lg">
              <h3 className="text-[16px] font-semibold text-[#101828] mb-3">
                Transaction Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[#475467]">Transaction ID:</span>
                  <span className="text-[14px] font-medium text-[#101828]">
                    #{transaction.id.slice(-8).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[#475467]">Type:</span>
                  <span className="text-[14px] font-medium text-[#101828]">
                    {getTransactionTypeLabel(transaction.type)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[#475467]">Amount:</span>
                  <span className="text-[18px] font-semibold text-[#101828]">
                    ₦{transaction.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[#475467]">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[12px] font-medium border ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-[14px] text-[#475467]">Description:</span>
                  <span className="text-[14px] font-medium text-[#101828] text-right max-w-[250px]">
                    {transaction.description || 'No description provided'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[#475467]">Date Created:</span>
                  <span className="text-[14px] font-medium text-[#101828]">
                    {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning for withdrawal/loan coverage */}
            {(transaction.type === 'withdrawal' || transaction.type === 'loan_coverage') && (
              <div className="p-4 bg-[#FFFCF5] border border-[#FEDF89] rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="mt-0.5 flex-shrink-0"
                  >
                    <path
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      fill="#F79009"
                    />
                  </svg>
                  <div>
                    <p className="text-[14px] font-medium text-[#B54708] mb-1">
                      Approval Required
                    </p>
                    <p className="text-[12px] text-[#B54708]">
                      This {transaction.type === 'withdrawal' ? 'withdrawal' : 'loan coverage'} transaction requires your approval before it can be processed.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
            {transaction.status === 'pending' && (
              <button
                type="button"
                onClick={handleApprove}
                className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-white bg-[#039855] border border-[#039855] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-[#027A48] transition-colors focus:outline-none focus:ring-2 focus:ring-[#039855] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Approving...' : 'Approve Transaction'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}