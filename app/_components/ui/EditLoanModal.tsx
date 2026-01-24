'use client';

import { useState, useEffect } from 'react';

interface Loan {
  id: string;
  loanId: string;
  name: string;
  status: 'Active' | 'Completed' | 'Defaulted';
  amount: number;
  interest: number;
  nextRepayment: string;
  creditOfficerId: string;
}

interface EditLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Loan) => void;
  loan: Loan | null;
}

export default function EditLoanModal({
  isOpen,
  onClose,
  onSave,
  loan
}: EditLoanModalProps) {
  const [formData, setFormData] = useState<Loan | null>(null);

  useEffect(() => {
    if (loan) {
      setFormData({ ...loan });
    }
  }, [loan]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
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
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-[#101828] mb-4">Edit Loan</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Loan ID
              </label>
              <input
                type="text"
                value={formData.loanId}
                onChange={(e) => setFormData({ ...formData, loanId: e.target.value })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Borrower Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Completed' | 'Defaulted' })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Defaulted">Defaulted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Amount (₦)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={formData.interest}
                onChange={(e) => setFormData({ ...formData, interest: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Next Repayment Date
              </label>
              <input
                type="text"
                value={formData.nextRepayment}
                onChange={(e) => setFormData({ ...formData, nextRepayment: e.target.value })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                placeholder="e.g., June 03, 2024"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#344054] bg-white border border-[#D0D5DD] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#7F56D9] rounded-lg hover:bg-[#6941C6] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
