"use client";

import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import { API_CONFIG } from "@/lib/api/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/context/AuthContext";
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
  const { session, logOut } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (session) {
      // Create profile from session data
      setProfile({
        id: 'current-user',
        firstName: 'User',
        lastName: '',
        email: '',
        role: session.role,
      });
    }
  }, [session]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      const userRole = session?.role;

      // Use official AuthContext logout
      logOut();

      toast.success("You have successfully logged out");

      let redirectPath = "/auth/bm/login";
      switch (userRole) {
        case 'system_admin':
        case 'admin':
          redirectPath = "/auth/bm/login";
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
          redirectPath = "/auth/bm/login";
      }

      setShowLogoutConfirm(false);
      window.location.href = redirectPath;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("An error occurred during logout");
      logOut();
      setShowLogoutConfirm(false);
      window.location.href = "/auth/bm/login";
    }
  };

  const handleProfileClick = () => {
    const userRole = session?.role;
    let settingsPath = "/dashboard/settings";

    switch (userRole) {
      case 'system_admin':
      case 'admin':
        settingsPath = "/dashboard/system-admin/settings";
        break;
      case 'branch_manager':
      case 'bm':
        settingsPath = "/dashboard/bm/settings";
        break;
      case 'account_manager':
      case 'am':
        settingsPath = "/dashboard/am/settings";
        break;
      default:
        settingsPath = "/dashboard/settings";
    }
    router.push(settingsPath);
  };

  const resolveImageUrl = (path: string | null | undefined) => {
    if (!path) return "/avatar.svg";
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/avatar.svg')) {
      return path;
    }
    return `${API_CONFIG.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const src = resolveImageUrl(data?.profilePicture || profile?.profilePicture);

  const getDisplayName = () => {
    if (data?.firstName) return data.firstName;

    if (profile) {
      if (profile.firstName) return profile.firstName;
      if ((profile as any).name) return (profile as any).name.split(' ')[0];
      if ((profile as any).fullName) return (profile as any).fullName.split(' ')[0];
      if (profile.role === 'system_admin' || profile.role === 'admin') return "System Admin";
    }

    return "User";
  };

  const displayName = getDisplayName();

  return (
    <>
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger className="flex items-center gap-2 transition outline-none cursor-pointer hover:opacity-80">
          <span className="font-medium text-[#021C3E]">{displayName}</span>

          <Avatar className="h-7 w-7 border border-gray-200">
            <AvatarImage src={src} alt="avatar" />
            <AvatarFallback className="bg-[#7F56D9] text-white text-[10px]">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <ChevronDown
            size={18}
            className={`text-[#5A6880] transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56 mt-2 bg-white" align="end">
          <DropdownMenuLabel className="border-b border-gray-50 pb-2">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#021C3E]">
                {data?.firstName && (data as any)?.lastName
                  ? `${data.firstName} ${(data as any).lastName}`
                  : (profile?.firstName && profile?.lastName)
                    ? `${profile.firstName} ${profile.lastName}`
                    : (profile as any)?.name || (profile as any)?.fullName || (profile?.role === 'system_admin' ? 'System Admin' : 'My Account')}
              </span>
              <span className="text-xs text-[#5A6880] font-normal lowercase">
                {profile?.role?.replace('_', ' ') || 'User'}
              </span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={handleProfileClick}
            className="cursor-pointer gap-2 py-2 hover:bg-gray-50"
          >
            <User size={16} className="text-[#5A6880]" />
            <span className="text-[#021C3E]">Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleProfileClick}
            className="cursor-pointer gap-2 py-2 hover:bg-gray-50"
          >
            <Settings size={16} className="text-[#5A6880]" />
            <span className="text-[#021C3E]">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-50" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 cursor-pointer gap-2 py-2 focus:text-white focus:bg-red-600"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setShowLogoutConfirm(false)}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#021C3E] mb-2">Confirm Logout</h3>
              <p className="text-[#5A6880]">Are you sure you want to log out of your account?</p>
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-[#525F7F] hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
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
