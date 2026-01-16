'use client';

import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  customerId: string;
  name: string;
  status: 'Active' | 'Scheduled';
  phoneNumber: string;
  email: string;
  dateJoined: string;
}

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer: Customer | null;
}

export default function EditCustomerModal({
  isOpen,
  onClose,
  onSave,
  customer
}: EditCustomerModalProps) {
  const [formData, setFormData] = useState<Customer | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData({ ...customer });
    }
  }, [customer]);

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
        backdropFilter: 'blur(16px)'
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg"
        style={{
          width: '688px',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#101828'
            }}
          >
            Edit Customer
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                className="block mb-1"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#344054'
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                style={{
                  padding: '10px 14px',
                  border: '1px solid #D0D5DD',
                  fontSize: '14px',
                  color: '#101828'
                }}
                required
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label
                className="block mb-1"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#344054'
                }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                style={{
                  padding: '10px 14px',
                  border: '1px solid #D0D5DD',
                  fontSize: '14px',
                  color: '#101828'
                }}
                placeholder="+234 XXX XXX XXXX"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                className="block mb-1"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#344054'
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                style={{
                  padding: '10px 14px',
                  border: '1px solid #D0D5DD',
                  fontSize: '14px',
                  color: '#101828'
                }}
                required
              />
            </div>

            {/* Status Field */}
            <div>
              <label
                className="block mb-1"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#344054'
                }}
              >
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Scheduled' })}
                className="w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                style={{
                  padding: '10px 14px',
                  border: '1px solid #D0D5DD',
                  fontSize: '14px',
                  color: '#101828'
                }}
              >
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>

            {/* Date Joined Field */}
            <div>
              <label
                className="block mb-1"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#344054'
                }}
              >
                Date Joined
              </label>
              <input
                type="text"
                value={formData.dateJoined}
                onChange={(e) => setFormData({ ...formData, dateJoined: e.target.value })}
                className="w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                style={{
                  padding: '10px 14px',
                  border: '1px solid #D0D5DD',
                  fontSize: '14px',
                  color: '#101828'
                }}
                placeholder="e.g., June 03, 2024"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg transition-colors"
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#344054',
                background: '#FFFFFF',
                border: '1px solid #D0D5DD'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg transition-colors hover:opacity-90"
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                background: '#7F56D9'
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
