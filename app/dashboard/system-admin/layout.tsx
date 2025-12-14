import { Metadata } from "next";
import React from "react";

import SystemAdminSidebar from "@/app/_components/layouts/dashboard/SystemAdminSidebar";
import Navbar from "@/app/_components/layouts/dashboard/Navbar";
import { SystemAdminGuard } from "@/app/components/AuthGuard";

export const metadata: Metadata = {
  title: {
    template: "%s | Kaytop App",
    default: "Welcome / System Admin Dashboard",
  },
  description:
    "Kaytop is a modern multipurpose investment platform that enables users to invest confidently, access financing, and grow wealth with ease.",
  icons: {
    icon: "/logo.png",
  },
};

export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F4F6FA] min-h-screen">
      <SystemAdminGuard>
        <Navbar />
        <div className="drawer lg:drawer-open" style={{ paddingTop: '70px' }}>
          <input
            id="my-drawer-4"
            type="checkbox"
            className="drawer-toggle lg:hidden"
            aria-label="Toggle navigation drawer"
          />
          <SystemAdminSidebar />
          {children}
        </div>
      </SystemAdminGuard>
    </div>
  );
}
