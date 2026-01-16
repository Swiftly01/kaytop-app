'use client';

import React, { useState, useEffect } from 'react';
import MultiSelectDropdown from './MultiSelectDropdown';

interface AssignUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedUserIds: string[]) => void;
  branchName?: string;
  currentlyAssignedUsers?: string[];
}

export default function AssignUsersModal({
  isOpen,
  onClose,
  onSubmit,
  branchName = 'this branch',
  currentlyAssignedUsers = [],
}: AssignUsersModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(currentlyAssignedUsers);

  // Sample users data - TODO: Replace with actual API call
  const availableUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
    { id: '4', name: 'Sarah Williams', email: 'sarah@example.com' },
    { id: '5', name: 'David Brown', email: 'david@example.com' },
    { id: '6', name: 'Emily Davis', email: 'emily@example.com' },
    { id: '7', name: 'Chris Wilson', email: 'chris@example.com' },
    { id: '8', name: 'Lisa Anderson', email: 'lisa@example.com' },
    { id: '9', name: 'Robert Taylor', email: 'robert@example.com' },
    { id: '10', name: 'Amanda Martinez', email: 'amanda@example.com' },
  ];

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers(currentlyAssignedUsers);
    }
  }, [isOpen, currentlyAssignedUsers]);

  // Update selected users when currentlyAssignedUsers changes
  useEffect(() => {
    if (isOpen) {
      setSelectedUsers(currentlyAssignedUsers);
    }
  }, [isOpen, currentlyAssignedUsers]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedUsers);
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

  const hasChanges = JSON.stringify(selectedUsers.sort()) !== JSON.stringify(currentlyAssignedUsers.sort());

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
          boxShadow:
            '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-5 border-b" style={{ borderColor: 'var(--color-border-gray-200)' }}>
          <div className="pr-10">
            <h2
              className="text-[18px] font-semibold leading-[28px] mb-1"
              style={{ color: 'var(--color-text-dark)' }}
            >
              Assign Users To Branch
            </h2>
            <p
              className="text-[14px] font-normal leading-[20px]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Select users to assign to {branchName}. You can assign multiple users at once.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
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
        <form onSubmit={handleSubmit}>
          <div className="px-6 pt-5 pb-8">
            {/* Assign Users Field */}
            <div className="flex items-start gap-8">
              <label
                className="w-[160px] text-[14px] font-medium leading-[20px] pt-[10px]"
                style={{ color: 'var(--color-text-medium)' }}
              >
                Select Users
              </label>
              <div className="flex-1">
                <MultiSelectDropdown
                  options={availableUsers}
                  selectedIds={selectedUsers}
                  onChange={setSelectedUsers}
                  placeholder="Select users to assign..."
                  searchPlaceholder="Search users..."
                />
                <p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {selectedUsers.length === 0
                    ? 'No users selected'
                    : `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} selected`}
                </p>
              </div>
            </div>

            {/* Currently Assigned Users Info */}
            {currentlyAssignedUsers.length > 0 && (
              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-gray-50)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-dark)' }}>
                  Currently Assigned: {currentlyAssignedUsers.length} user
                  {currentlyAssignedUsers.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Your selection will replace the current assignments
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 pb-6 pt-8 border-t" style={{ borderColor: 'var(--color-border-gray-200)' }}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] bg-white rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:bg-gray-50 transition-colors duration-200"
                style={{
                  color: 'var(--color-text-medium)',
                  border: '1px solid var(--color-border-gray-300)',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-[18px] py-[10px] text-[16px] font-semibold leading-[24px] text-white rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--color-primary-600)',
                  border: '1px solid var(--color-primary-600)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6941C6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
                }}
              >
                {hasChanges ? 'Assign Users' : 'Close'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
