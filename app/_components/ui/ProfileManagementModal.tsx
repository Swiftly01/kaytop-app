'use client';

import { useState, useEffect } from 'react';
import { profileService } from '@/lib/services/profile';
import { useToast } from '@/app/hooks/useToast';
import type { AdminProfile, UpdateUserData } from '@/lib/api/types';

interface ProfileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: AdminProfile | null;
  onSuccess?: (updatedProfile: AdminProfile) => void;
}

export default function ProfileManagementModal({
  isOpen,
  onClose,
  currentProfile,
  onSuccess
}: ProfileManagementModalProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    branch: '',
    state: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  // Initialize form data when modal opens or profile changes
  useEffect(() => {
    if (isOpen && currentProfile) {
      setFormData({
        firstName: currentProfile.firstName || '',
        lastName: currentProfile.lastName || '',
        email: currentProfile.email || '',
        mobileNumber: currentProfile.mobileNumber || '',
        branch: currentProfile.branch || '',
        state: currentProfile.state || ''
      });
    }
  }, [isOpen, currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName?.trim()) {
      error('First name is required');
      return;
    }

    if (!formData.lastName?.trim()) {
      error('Last name is required');
      return;
    }

    if (!formData.email?.trim()) {
      error('Email is required');
      return;
    }

    if (!formData.mobileNumber?.trim()) {
      error('Mobile number is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updatedProfile = await profileService.updateProfile(formData);
      
      success('Profile updated successfully');
      
      onSuccess?.(updatedProfile);
      onClose();
      
    } catch (err) {
      console.error('Profile update error:', err);
      error(err instanceof Error ? err.message : 'Failed to update profile');
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
        className="bg-white rounded-[12px] w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
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
              Edit Profile
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#475467]">
              Update your profile information
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
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                  required
                  className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                  required
                  className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
                className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
            </div>

            {/* Mobile Number Field */}
            <div>
              <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                value={formData.mobileNumber || ''}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                placeholder="Enter mobile number"
                required
                className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
              />
            </div>

            {/* Branch and State Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                  Branch
                </label>
                <input
                  type="text"
                  value={formData.branch || ''}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="Enter branch"
                  className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Enter state"
                  className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#101828] placeholder:text-[#667085] bg-white border border-[#D0D5DD] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] transition-all"
                />
              </div>
            </div>

            {/* Role Display (Read-only) */}
            {currentProfile && (
              <div>
                <label className="block text-[14px] font-medium leading-[20px] text-[#344054] mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={currentProfile.role.replace('_', ' ').toUpperCase()}
                  readOnly
                  className="w-full px-[14px] py-[10px] text-[16px] leading-[24px] text-[#667085] bg-[#F9FAFB] border border-[#EAECF0] rounded-lg cursor-not-allowed"
                />
                <p className="text-[12px] text-[#667085] mt-1">
                  Role cannot be changed from this interface
                </p>
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
            <button
              type="submit"
              className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-white bg-[#7F56D9] border border-[#7F56D9] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}