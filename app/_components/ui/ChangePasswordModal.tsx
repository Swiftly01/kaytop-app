'use client';

import { useState } from 'react';
import { profileService } from '@/lib/services/profile';
import { useToast } from '@/app/hooks/useToast';
import type { ChangePasswordData } from '@/lib/api/types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess
}: ChangePasswordModalProps) {
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword) {
      error('Current password is required');
      return;
    }

    if (!formData.newPassword) {
      error('New password is required');
      return;
    }

    if (formData.newPassword.length < 8) {
      error('New password must be at least 8 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      error('New passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      error('New password must be different from current password');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await profileService.changePassword(formData);
      
      success('Password changed successfully');
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      
      onSuccess?.();
      onClose();
      
    } catch (err) {
      console.error('Password change error:', err);
      error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
              Change Password
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#475467]">
              Update your account password
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
            {/* Current Password Field */}
            <div>
              <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                  className="w-full px-[14px] py-[10px] pr-[44px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#667085] hover:text-[#344054] transition-colors"
                >
                  {showPasswords.current ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12.108 12.108C11.4915 12.7245 10.6962 13.0833 9.86667 13.0833C9.03714 13.0833 8.24181 12.7245 7.62533 12.108C7.00885 11.4915 6.65 10.6962 6.65 9.86667C6.65 9.03714 7.00885 8.24181 7.62533 7.62533C8.24181 7.00885 9.03714 6.65 9.86667 6.65C10.6962 6.65 11.4915 7.00885 12.108 7.62533C12.7245 8.24181 13.0833 9.03714 13.0833 9.86667C13.0833 10.6962 12.7245 11.4915 12.108 12.108Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.5 9.86667C2.5 9.86667 5.83333 3.2 9.86667 3.2C13.9 3.2 17.2333 9.86667 17.2333 9.86667C17.2333 9.86667 13.9 16.5333 9.86667 16.5333C5.83333 16.5333 2.5 9.86667 2.5 9.86667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M14.95 14.95C13.4822 16.0695 11.7072 16.6738 9.86667 16.5333C5.83333 16.5333 2.5 9.86667 2.5 9.86667C3.45833 8.06667 4.73333 6.58333 6.21667 5.45M8.25 4.06667C8.78333 3.93333 9.31667 3.86667 9.86667 3.86667C13.9 3.86667 17.2333 10.5333 17.2333 10.5333C16.7167 11.4833 16.1167 12.35 15.45 13.1167M11.7667 11.7667C11.5284 12.0697 11.2347 12.3209 10.9021 12.5057C10.5695 12.6905 10.2046 12.8052 9.82654 12.8433C9.44848 12.8814 9.06707 12.8421 8.70516 12.7278C8.34325 12.6135 8.00844 12.4267 7.72344 12.1817C7.43844 11.9367 7.25159 11.6385 7.13729 11.3099C7.023 10.9814 6.98369 10.6299 7.02179 10.2519C7.05989 9.87384 7.17458 9.50891 7.35938 9.17632C7.54418 8.84374 7.79541 8.55007 8.09833 8.31167" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.5 2.5L17.5 17.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  className="w-full px-[14px] py-[10px] pr-[44px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#667085] hover:text-[#344054] transition-colors"
                >
                  {showPasswords.new ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12.108 12.108C11.4915 12.7245 10.6962 13.0833 9.86667 13.0833C9.03714 13.0833 8.24181 12.7245 7.62533 12.108C7.00885 11.4915 6.65 10.6962 6.65 9.86667C6.65 9.03714 7.00885 8.24181 7.62533 7.62533C8.24181 7.00885 9.03714 6.65 9.86667 6.65C10.6962 6.65 11.4915 7.00885 12.108 7.62533C12.7245 8.24181 13.0833 9.03714 13.0833 9.86667C13.0833 10.6962 12.7245 11.4915 12.108 12.108Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.5 9.86667C2.5 9.86667 5.83333 3.2 9.86667 3.2C13.9 3.2 17.2333 9.86667 17.2333 9.86667C17.2333 9.86667 13.9 16.5333 9.86667 16.5333C5.83333 16.5333 2.5 9.86667 2.5 9.86667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M14.95 14.95C13.4822 16.0695 11.7072 16.6738 9.86667 16.5333C5.83333 16.5333 2.5 9.86667 2.5 9.86667C3.45833 8.06667 4.73333 6.58333 6.21667 5.45M8.25 4.06667C8.78333 3.93333 9.31667 3.86667 9.86667 3.86667C13.9 3.86667 17.2333 10.5333 17.2333 10.5333C16.7167 11.4833 16.1167 12.35 15.45 13.1167M11.7667 11.7667C11.5284 12.0697 11.2347 12.3209 10.9021 12.5057C10.5695 12.6905 10.2046 12.8052 9.82654 12.8433C9.44848 12.8814 9.06707 12.8421 8.70516 12.7278C8.34325 12.6135 8.00844 12.4267 7.72344 12.1817C7.43844 11.9367 7.25159 11.6385 7.13729 11.3099C7.023 10.9814 6.98369 10.6299 7.02179 10.2519C7.05989 9.87384 7.17458 9.50891 7.35938 9.17632C7.54418 8.84374 7.79541 8.55007 8.09833 8.31167" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.5 2.5L17.5 17.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[12px] text-[#667085] mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm New Password Field */}
            <div>
              <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmNewPassword}
                  onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-[14px] py-[10px] pr-[44px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#667085] hover:text-[#344054] transition-colors"
                >
                  {showPasswords.confirm ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12.108 12.108C11.4915 12.7245 10.6962 13.0833 9.86667 13.0833C9.03714 13.0833 8.24181 12.7245 7.62533 12.108C7.00885 11.4915 6.65 10.6962 6.65 9.86667C6.65 9.03714 7.00885 8.24181 7.62533 7.62533C8.24181 7.00885 9.03714 6.65 9.86667 6.65C10.6962 6.65 11.4915 7.00885 12.108 7.62533C12.7245 8.24181 13.0833 9.03714 13.0833 9.86667C13.0833 10.6962 12.7245 11.4915 12.108 12.108Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.5 9.86667C2.5 9.86667 5.83333 3.2 9.86667 3.2C13.9 3.2 17.2333 9.86667 17.2333 9.86667C17.2333 9.86667 13.9 16.5333 9.86667 16.5333C5.83333 16.5333 2.5 9.86667 2.5 9.86667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M14.95 14.95C13.4822 16.0695 11.7072 16.6738 9.86667 16.5333C5.83333 16.5333 2.5 9.86667 2.5 9.86667C3.45833 8.06667 4.73333 6.58333 6.21667 5.45M8.25 4.06667C8.78333 3.93333 9.31667 3.86667 9.86667 3.86667C13.9 3.86667 17.2333 10.5333 17.2333 10.5333C16.7167 11.4833 16.1167 12.35 15.45 13.1167M11.7667 11.7667C11.5284 12.0697 11.2347 12.3209 10.9021 12.5057C10.5695 12.6905 10.2046 12.8052 9.82654 12.8433C9.44848 12.8814 9.06707 12.8421 8.70516 12.7278C8.34325 12.6135 8.00844 12.4267 7.72344 12.1817C7.43844 11.9367 7.25159 11.6385 7.13729 11.3099C7.023 10.9814 6.98369 10.6299 7.02179 10.2519C7.05989 9.87384 7.17458 9.50891 7.35938 9.17632C7.54418 8.84374 7.79541 8.55007 8.09833 8.31167" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.5 2.5L17.5 17.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
              {formData.newPassword && formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword && (
                <p className="text-[12px] text-[#F04438] mt-1">
                  Passwords do not match
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
              disabled={isSubmitting || formData.newPassword !== formData.confirmNewPassword}
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
