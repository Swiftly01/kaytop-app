import { Metadata } from "next";
import React from "react";
import Sidebar from "@/app/_components/layouts/dashboard/Sidebar";
import Navbar from "@/app/_components/layouts/dashboard/Navbar";
import QueryProvider from "@/app/_components/ui/QueryProvider";
import { AccountManagerGuard } from "@/app/components/AuthGuard";
import { MenuItem } from "@/app/types/routes";

export const metadata: Metadata = {
  title: {
    template: "%s | Kaytop App",
    default: "Welcome / Account Manager Dashboard",
  },
  description:
    "Kaytop is a modern multipurpose investment platform that enables users to invest confidently, access financing, and grow wealth with ease.",
  icons: {
    icon: "/logo.png",
  },
};

const amMenuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: "/dashboard.svg",
    link: "/dashboard/am",
  },
  {
    label: "Branches",
    icon: "/branches.svg",
    link: "/dashboard/am/branches",
  },
  {
    label: "Credit Officers",
    icon: "/credit.svg",
    link: "/dashboard/am/credit-officers",
  },
  {
    label: "Customers",
    icon: "/customer.svg",
    link: "/dashboard/am/customers",
  },
  {
    label: "Loans",
    icon: "/loans.svg",
    link: "/dashboard/am/loans",
  },
  {
    label: "Reports",
    icon: "/report.svg",
    link: "/dashboard/am/reports",
  },
  {
    label: "Settings",
    icon: "/settings.svg",
    link: "/dashboard/am/settings",
  },
];

export default function AccountManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F4F6FA] min-h-screen">
      <AccountManagerGuard>
        <QueryProvider>
          <Navbar />
          <div className="drawer lg:drawer-open" style={{ paddingTop: '70px' }}>
            <input
              id="my-drawer-4"
              type="checkbox"
              className="drawer-toggle lg:hidden"
              aria-label="Toggle navigation drawer"
            />
            <Sidebar items={amMenuItems} />
            {children}
          </div>
        </QueryProvider>
      </AccountManagerGuard>
    </div>
  );
}
