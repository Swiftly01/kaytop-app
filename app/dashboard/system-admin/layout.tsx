import { Metadata } from "next";
import React from "react";
import Sidebar from "@/app/_components/layouts/dashboard/Sidebar";
import Navbar from "@/app/_components/layouts/dashboard/Navbar";
import QueryProvider from "@/app/_components/ui/QueryProvider";
import { MenuItem } from "@/app/types/routes";

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

const systemAdminMenuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: "/dashboard.svg",
    link: "/dashboard/system-admin",
  },
  {
    label: "Branches",
    icon: "/branches.svg",
    link: "/dashboard/system-admin/branches",
  },
  {
    label: "Credit Officers",
    icon: "/credit.svg",
    link: "/dashboard/system-admin/credit-officers",
  },
  {
    label: "Customers",
    icon: "/customer.svg",
    link: "/dashboard/system-admin/customers",
  },
  {
    label: "Loans",
    icon: "/loans.svg",
    link: "/dashboard/system-admin/loans",
  },
  {
    label: "Reports",
    icon: "/report.svg",
    link: "/dashboard/system-admin/reports",
  },
  {
    label: "Settings",
    icon: "/settings.svg",
    link: "/dashboard/system-admin/settings",
  },
];

export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F4F6FA] min-h-screen">
      <QueryProvider>
        <Navbar />
        <div className="drawer lg:drawer-open" style={{ paddingTop: '70px' }}>
          <input
            id="my-drawer-4"
            type="checkbox"
            className="drawer-toggle lg:hidden"
            aria-label="Toggle navigation drawer"
            suppressHydrationWarning
          />
          <Sidebar items={systemAdminMenuItems} />
          {children}
        </div>
      </QueryProvider>
    </div>
  );
}
