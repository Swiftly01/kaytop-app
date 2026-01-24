"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { AddCustomerFlowProvider } from "./AddCustomerFlow/AddCustomerFlowProvider";
import AddCustomerFlowModal from "./AddCustomerFlow/AddCustomerFlowModal";
import { Toaster } from "react-hot-toast";
import DashboardWrapper from "@/app/_components/ui/auth/DashboardWrapper";
import { profileService } from "@/app/services/profileService";
import { AxiosError } from "axios";
import Image from "next/image";
import logo from "@/public/logo.png";
import ProfileDropdown from "@/app/_components/ui/ProfileDropdown";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import { ProfileResponse } from "@/app/types/settings";
import toast from "react-hot-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SpinnerLg from "@/app/_components/ui/SpinnerLg";
import { usePathname, useRouter } from "next/navigation";


interface DashboardShellProps {
  children: React.ReactNode;
  profile: ProfileResponse | null;
}

export default function DashboardShell({
  children,
  profile,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

const isActive = (href: string) => {
  // Dashboard should only be active on exact match
  if (href === "/dashboard/agent") {
    return pathname === href;
  }

  // Other routes can match nested paths
  return pathname === href || pathname.startsWith(`${href}/`);
};



  const handleLogout = () => {
    logOut();
    toast.success("You have successfully logged out");
    router.push("/auth/user/login");
  };

  const src =
    profile && profile.profilePicture !== null ? profile.profilePicture : "/avatar.svg";
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-[#3b0f6b] text-white shadow-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <button
                className="p-2 rounded cursor-pointer md:hidden hover:bg-white/10"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2">
                <Image src={logo} alt="Kaytop logo" height={40} />
                <span className="font-semibold">Kaytop MI</span>
              </div>

              {/* Desktop Nav */}
              <nav className="items-center hidden gap-3 ml-6 text-sm md:flex">
                <Link
                  href="/dashboard/agent"
                  className={`px-3 py-1 rounded-md transition
      ${isActive("/dashboard/agent")
        ? "bg-white text-[#3b0f6b]"
        : "hover:bg-white/10"}
    `}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/agent/customer"
                  className={`px-3 py-1 rounded-md transition
                    ${isActive("/dashboard/agent/customer")
                        ? "bg-white text-[#3b0f6b]"
                        : "hover:bg-white/10"}
                    `}
                >
                  Customers
                </Link>
                <Link
                  href="/dashboard/agent/loans"
                  className={`px-3 py-1 rounded-md transition
                ${isActive("/dashboard/agent/loans")
                    ? "bg-white text-[#3b0f6b]"
                    : "hover:bg-white/10"}
                `}
                >
                  Loans
                </Link>
                <Link
                  href="/dashboard/agent/reports"
                  className={`px-3 py-1 rounded-md transition
                ${isActive("/dashboard/agent/reports")
                    ? "bg-white text-[#3b0f6b]"
                    : "hover:bg-white/10"}
                `}
                >
                  Reports
                </Link>
              </nav>
            </div>

            {/* RIGHT */}
             <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2 transition outline-none cursor-pointer hover:opacity-80">
        <span className="font-medium">{profile?.firstName}</span>

        <Avatar className="h-7 w-7">
          <AvatarImage src={src} alt="avatar" />
          <AvatarFallback>
            <SpinnerLg />
          </AvatarFallback>
        </Avatar>

        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <Link href="/dashboard/agent/settings">
          <DropdownMenuItem className="cursor-pointer">
            Settings
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={handleLogout}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= MOBILE SIDEBAR ================= */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="logo" height={32} />
            <span className="font-semibold text-[#3b0f6b]">Kaytop MI</span>
          </div>

          <button className="cursor-pointer" onClick={() => setMobileOpen(false)}>
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <nav className="flex flex-col p-4 text-sm">
          <Link href="/dashboard/agent" className={`px-3 py-2 rounded transition
      ${isActive("/dashboard/agent")
        ? "bg-[#3b0f6b] text-white"
        : "hover:bg-gray-100"}
    `}>
            Dashboard
          </Link>
          <Link
            href="/dashboard/agent/customer"
            className={`px-3 py-2 rounded transition
      ${isActive("/dashboard/agent/customer")
        ? "bg-[#3b0f6b] text-white"
        : "hover:bg-gray-100"}
    `}
          >
            Customers
          </Link>
          <Link
            href="/dashboard/agent/loans"
            className={`px-3 py-2 rounded transition
      ${isActive("/dashboard/agent/loans")
        ? "bg-[#3b0f6b] text-white"
        : "hover:bg-gray-100"}
    `}
          >
            Loans
          </Link>
          <Link
            href="/dashboard/agent/reports"
            className={`px-3 py-2 rounded transition
      ${isActive("/dashboard/agent/reports")
        ? "bg-[#3b0f6b] text-white"
        : "hover:bg-gray-100"}
    `}
          >
            Reports
          </Link>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 w-full p-6 mx-auto max-w-7xl">
        <DashboardWrapper>
          <AddCustomerFlowProvider>
            {children}
            <AddCustomerFlowModal />
          </AddCustomerFlowProvider>
        </DashboardWrapper>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="py-4 text-sm text-center text-gray-500">
        © 2025 Kaytop MI. All rights reserved.
      </footer>
    </div>
  );
}
