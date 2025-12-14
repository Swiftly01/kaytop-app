"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { profileService } from "@/lib/services/profile";
import { useToast } from "@/app/hooks/useToast";
import ProfileManagementModal from "./ProfileManagementModal";
import ChangePasswordModal from "./ChangePasswordModal";
import type { AdminProfile } from "@/lib/api/types";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  const router = useRouter();
  const { user, logout } = useAuth();
  const { success, error } = useToast();

  // Load profile data on component mount
  useEffect(() => {
    if (user) {
      setProfile(user);
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profileData = await profileService.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Use existing user data if profile fetch fails
      if (user) {
        setProfile(user);
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileClick = () => {
    setOpen(false);
    setShowProfileModal(true);
  };

  const handleChangePasswordClick = () => {
    setOpen(false);
    setShowPasswordModal(true);
  };

  const handleSettingsClick = () => {
    setOpen(false);
    router.push('/dashboard/system-admin/settings');
  };

  const handleLogoutClick = () => {
    setOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      success('Logged out successfully');
      router.push('/auth/system-admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      error('Failed to logout properly');
      // Force redirect even if logout fails
      router.push('/auth/system-admin/login');
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const handleProfileUpdateSuccess = (updatedProfile: AdminProfile) => {
    setProfile(updatedProfile);
    success('Profile updated successfully');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div 
      className="flex items-center gap-3"
      style={{
        marginRight: 'calc(100% - 96.25%)', // Position dropdown arrow at 96.25% from left
      }}
    >
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger 
          className="flex items-center gap-3 transition outline-none cursor-pointer hover:opacity-80 focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 rounded-md"
          aria-label="User menu"
        >
          {/* User name - positioned at 78.75% from left, 34.29% from top */}
          <span 
            className="font-open-sauce-sans text-right"
            style={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '20px',
            }}
          >
            {profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}
          </span>

          {/* User avatar - 29x29px circle, positioned at 86.88% from left */}
          <Avatar 
            style={{
              width: '29px',
              height: '29px',
            }}
          >
            <AvatarImage src="/avatar.svg" alt={`${profile?.firstName || 'User'} profile picture`} />
            <AvatarFallback>
              {profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}` : 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Dropdown arrow - 14x14px, positioned at 96.25% from left */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
            aria-hidden="true"
          >
            <path
              d="M3.5 5.25L7 8.75L10.5 5.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>
            {profile ? `${profile.firstName} ${profile.lastName}` : 'My Account'}
          </DropdownMenuLabel>

          <DropdownMenuItem 
            className="cursor-pointer focus:bg-[#F9F5FF] focus:text-[#7F56D9]" 
            onClick={handleProfileClick}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Edit Profile
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer focus:bg-[#F9F5FF] focus:text-[#7F56D9]" 
            onClick={handleChangePasswordClick}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Change Password
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer focus:bg-[#F9F5FF] focus:text-[#7F56D9]" 
            onClick={handleSettingsClick}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700" 
            onClick={handleLogoutClick}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#021C3E] mb-1">
                  Confirm Logout
                </h3>
                <p className="text-sm text-[#667085]">
                  Are you sure you want to logout? You will need to sign in again to access your account.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 text-[#344054] border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Management Modal */}
      <ProfileManagementModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentProfile={profile}
        onSuccess={handleProfileUpdateSuccess}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => success('Password changed successfully')}
      />
    </div>
  );
}
