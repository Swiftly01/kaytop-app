"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { AddCustomerFlowProvider } from "./AddCustomerFlow/AddCustomerFlowProvider";
import AddCustomerFlowModal from "./AddCustomerFlow/AddCustomerFlowModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="w-full bg-[#3b0f6b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center gap-4">
              {/* Hamburger (Mobile Only) */}
              <button
                className="md:hidden p-2 rounded hover:bg-white/10 transition"
                onClick={() => setOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="logo" className="h-6" />
                <span className="font-semibold">Kaytop MI</span>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-3 text-sm ml-4">
                <Link href="/dashboard" className="px-3 py-1 rounded-md bg-white/10">
                  Dashboard
                </Link>
                <Link href="/dashboard/agent/customer" className="px-3 py-1 rounded-md hover:bg-white/5">
                  Customers
                </Link>
                <Link href="/dashboard/agent/loans" className="px-3 py-1 rounded-md hover:bg-white/5">
                  Loans
                </Link>
              </nav>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              <button className="hidden md:inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-md">
                Search
              </button>
              
              <Link href="/dashboard/agent/settings">
              <img
                src="/avatar.jpg"
                alt="avatar"
                className="h-8 w-8 rounded-full object-cover cursor-pointer"
              />
            </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-In Navigation */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="h-6" />
            <span className="font-semibold text-[#3b0f6b]">Kaytop MI</span>
          </div>

          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <nav className="flex flex-col p-4 text-gray-800">
          <Link
            href="/dashboard"
            className="px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/customers"
            className="px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Customers
          </Link>
          <Link
            href="/loans"
            className="px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Loans
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6">
        {/* {children} */}
        <AddCustomerFlowProvider>
          {children}
          <AddCustomerFlowModal />
        </AddCustomerFlowProvider>
        </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-sm text-gray-500">
        © 2025 Kaytop MI. All rights reserved.
      </footer>
    </div>
  );
}
