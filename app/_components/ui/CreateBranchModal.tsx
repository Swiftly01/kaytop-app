'use client';

import React, { useState, useEffect } from 'react';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BranchFormData) => void;
}

interface BranchFormData {
  branchName: string;
  stateRegion: string;
  assignUsers: string;
}

export default function CreateBranchModal({ isOpen, onClose, onSubmit }: CreateBranchModalProps) {
  const [formData, setFormData] = useState<BranchFormData>({
    branchName: '',
    stateRegion: '',
    assignUsers: '',
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        branchName: '',
        stateRegion: '',
        assignUsers: '',
      });
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        className="bg-white rounded-[12px] w-[688px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-[#EAECF0]">
          <div className="pr-10">
            <h2 className="text-[18px] font-semibold leading-[28px] text-[#101828] mb-1">
              Add New Branch
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#475467]">
              Tell us about your customer. It only takes a few minutes.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 pt-5 pb-8 space-y-4">
            {/* Branch Name Field */}
            <div className="flex items-center gap-8">
              <label className="w-[160px] text-[14px] font-medium leading-[20px] text-[#344054]">
                Branch name
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  placeholder="e.g. Linear"
                  className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                />
              </div>
            </div>

            {/* State/Region Field */}
            <div className="flex items-center gap-8">
              <label className="w-[160px] text-[14px] font-medium leading-[20px] text-[#344054]">
                State/Region
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.stateRegion}
                  onChange={(e) => setFormData({ ...formData, stateRegion: e.target.value })}
                  placeholder="www.example.com"
                  className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                />
              </div>
            </div>

            {/* Assign Users Field */}
            <div className="flex items-center gap-8">
              <label className="w-[160px] text-[14px] font-medium leading-[20px] text-[#344054]">
                Assign users
              </label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.assignUsers}
                  onChange={(e) => setFormData({ ...formData, assignUsers: e.target.value })}
                  placeholder="e.g. Linear"
                  className="w-full px-[14px] py-[10px] pr-[40px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                />
                {/* Dropdown Icon */}
                <div className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 pb-6 pt-8 border-t border-[#EAECF0]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-[#344054] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-white bg-[#7F56D9] border border-[#7F56D9] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-[#6941C6] transition-colors"
              >
                Create Branch
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
