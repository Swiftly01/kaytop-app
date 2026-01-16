'use client';

import { useState, useEffect } from 'react';

interface MissedReport {
  id: string;
  reportId: string;
  branchName: string;
  status: 'Missed';
  dateDue: string;
}

interface EditMissedReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: MissedReport) => void;
  report: MissedReport | null;
}

export default function EditMissedReportModal({
  isOpen,
  onClose,
  onSave,
  report
}: EditMissedReportModalProps) {
  const [formData, setFormData] = useState<MissedReport | null>(null);

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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(52, 64, 84, 0.7)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-[#101828] mb-4">Edit Missed Report</h3>
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
                Status
              </label>
              <input
                type="text"
                value={formData.status}
                disabled
                className="w-full px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Status cannot be changed for missed reports</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1">
                Date Due
              </label>
              <input
                type="text"
                value={formData.dateDue}
                onChange={(e) => setFormData({ ...formData, dateDue: e.target.value })}
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
