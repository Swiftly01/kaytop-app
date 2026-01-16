"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import DashboardWrapper from "@/app/_components/ui/auth/DashboardWrapper";
import Image from "next/image";
import logo from "@/public/logo.png";
import {useAuth } from "@/app/context/AuthContext";
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
  if (href === "/dashboard/customer") {
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-[#3b0f6b] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <button
                className="md:hidden p-2 rounded hover:bg-white/10 cursor-pointer"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2">
                <Image src={logo} alt="Kaytop logo" height={40} />
                <span className="font-semibold">Kaytop MI</span>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-3 text-sm ml-6">
                <Link
                  href="/dashboard/customer"
                  className={`px-3 py-1 rounded-md transition
      ${isActive("/dashboard/customer")
        ? "bg-white text-[#3b0f6b]"
        : "hover:bg-white/10"}
    `}
                >
                  Dashboard
                </Link>
                {/* <Link
                  href="/dashboard/customer/customer"
                  className={`px-3 py-1 rounded-md transition
                    ${isActive("/dashboard/customer/customer")
                        ? "bg-white text-[#3b0f6b]"
                        : "hover:bg-white/10"}
                    `}
                >
                  Customers
                </Link>
                <Link
                  href="/dashboard/customer/loans"
                  className={`px-3 py-1 rounded-md transition
                ${isActive("/dashboard/customer/loans")
                    ? "bg-white text-[#3b0f6b]"
                    : "hover:bg-white/10"}
                `}
                >
                  Loans
                </Link> */}
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
        <Link href="/dashboard/customer/settings">
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
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= MOBILE SIDEBAR ================= */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="logo" height={32} />
            <span className="font-semibold text-[#3b0f6b]">Kaytop MI</span>
          </div>

          <button className="cursor-pointer" onClick={() => setMobileOpen(false)}>
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <nav className="flex flex-col p-4 text-sm">
          <Link href="/dashboard/customer" className={`px-3 py-2 rounded transition
      ${isActive("/dashboard/customer")
        ? "bg-[#3b0f6b] text-white"
        : "hover:bg-gray-100"}
    `}>
            Dashboard
          </Link>
          {/* <Link
            href="/dashboard/customer/customer"
            className={`px-3 py-2 rounded transition
      ${isActive("/dashboard/customer/customer")
        ? "bg-[#3b0f6b] text-white"
        : "hover:bg-gray-100"}
    `}
          >
            Customers
          </Link>
          <Link
            href="/dashboard/customer/loans"
            className={`px-3 py-2 rounded transition
      ${isActive("/dashboard/customer/loans")
        ? "bg-[#3b0f6b] text-white"
        : "hover:bg-gray-100"}
    `}
          >
            Loans
          </Link> */}
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6">
        <DashboardWrapper>
            {children}
        </DashboardWrapper>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="py-4 text-center text-sm text-gray-500">
        © 2025 Kaytop MI. All rights reserved.
      </footer>
    </div>
  );
}
