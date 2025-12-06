'use client';

import { useState, useEffect } from 'react';

interface CreditOfficer {
  id: string;
  name: string;
  idNumber: string;
  status: 'Active' | 'In active';
  phone: string;
  email: string;
  dateJoined: string;
}

interface EditCreditOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (officer: CreditOfficer) => void;
  officer: CreditOfficer | null;
}

export default function EditCreditOfficerModal({
  isOpen,
  onClose,
  onSave,
  officer
}: EditCreditOfficerModalProps) {
  const [formData, setFormData] = useState<CreditOfficer | null>(null);

  useEffect(() => {
    if (officer) {
      setFormData({ ...officer });
    }
  }, [officer]);

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
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-[#101828] mb-4">Edit Credit Officer</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Name
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
                ID Number
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'In active' })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
              >
                <option value="Active">Active</option>
                <option value="In active">In active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Date Joined
              </label>
              <input
                type="text"
                value={formData.dateJoined}
                onChange={(e) => setFormData({ ...formData, dateJoined: e.target.value })}
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
