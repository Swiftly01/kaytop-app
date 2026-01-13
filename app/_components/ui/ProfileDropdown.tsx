"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { authenticationManager } from "@/lib/api/authManager";
import { authService } from "@/lib/services/auth";
import toast from "react-hot-toast";

interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePicture?: string;
}

interface ProfileResponse {
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
}

interface ProfileProps {
  data?: ProfileResponse;
}

export default function ProfileDropdown({ data }: ProfileProps) {
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const user = authenticationManager.getCurrentUser();
    if (user) {
      setProfile(user);
    }
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // Get user role before clearing auth
      const currentUser = authenticationManager.getCurrentUser();
      const userRole = currentUser?.role;
      
      // Debug logging to see what role is detected
      console.log('🔍 Logout Debug - Current User:', currentUser);
      console.log('🔍 Logout Debug - User Role:', userRole);
      
      // Call auth service logout (handles any server-side cleanup if available)
      await authService.logout();
      
      // Force clear all authentication data including cookies
      authenticationManager.forceLogout();
      
      // Show success message
      toast.success("You have successfully logged out");
      
      // Redirect based on user role with more comprehensive matching
      let redirectPath = "/auth/bm/login"; // default to BM login for most users
      
      console.log('🔍 Logout Debug - User Role:', userRole);
      
      // Use the API role format (lowercase with underscores)
      switch (userRole) {
        case 'system_admin':
        case 'admin':
          redirectPath = "/auth/login";
          break;
        case 'branch_manager':
        case 'bm':
          redirectPath = "/auth/bm/login";
          break;
        case 'account_manager':
        case 'am':
          redirectPath = "/auth/am/login";
          break;
        case 'credit_officer':
        case 'co':
          redirectPath = "/auth/co/login";
          break;
        case 'customer':
        case 'user':
          redirectPath = "/auth/customer/login";
          break;
        default:
          // Fallback: if role doesn't match expected values, default to BM login
          redirectPath = "/auth/bm/login";
      }
      
      console.log('🔍 Logout Debug - Redirect Path:', redirectPath);
      
      // Close modal and redirect
      setShowLogoutConfirm(false);
      
      // Use window.location for a hard redirect to ensure cookies are cleared
      window.location.href = redirectPath;
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("An error occurred during logout");
      
      // Even if server logout fails, still clear local state
      authenticationManager.forceLogout();
      setShowLogoutConfirm(false);
      window.location.href = "/auth/bm/login"; // Default to BM login on error
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowLogoutConfirm(false);
    }
  };

  const handleProfileClick = () => {
    router.push("/dashboard/settings");
  };

  const handleSettingsClick = () => {
    router.push("/dashboard/settings");
  };

  const src = data?.profilePicture || profile?.profilePicture || "/avatar.svg";
  const displayName = data?.firstName || profile?.firstName || "User";

  return (
    <>
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger className="flex items-center gap-2 transition outline-none cursor-pointer hover:opacity-80">
          <span className="font-medium">{displayName}</span>

          <Avatar className="h-7 w-7">
            <AvatarImage src={src} alt="avatar" />
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <ChevronDown
            size={18}
            className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          />
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
            onClick={handleLogout}
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(52, 64, 84, 0.7)',
            backdropFilter: 'blur(16px)'
          }}
          onClick={handleBackdropClick}
        >
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
    </>
  );
}
