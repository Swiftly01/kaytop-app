'use client';

import { useState, useEffect } from 'react';

interface Report {
  id: string;
  reportId: string;
  branchName: string;
  timeSent: string;
  date: string;
}

interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Report) => void;
  report: Report | null;
}

export default function EditReportModal({
  isOpen,
  onClose,
  onSave,
  report
}: EditReportModalProps) {
  const [formData, setFormData] = useState<Report | null>(null);

  useEffect(() => {
    if (report) {
      setFormData({ ...report });
    }
  }, [report]);

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
        <h3 className="text-lg font-semibold text-[#101828] mb-4">Edit Report</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Report ID
              </label>
              <input
                type="text"
                value={formData.reportId}
                onChange={(e) => setFormData({ ...formData, reportId: e.target.value })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Branch Name
              </label>
              <input
                type="text"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Time Sent (Email)
              </label>
              <input
                type="email"
                value={formData.timeSent}
                onChange={(e) => setFormData({ ...formData, timeSent: e.target.value })}
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7F56D9]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Date
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
