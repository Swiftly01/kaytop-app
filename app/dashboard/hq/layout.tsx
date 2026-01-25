import { Metadata } from "next";
import React from "react";
import Sidebar from "@/app/_components/layouts/dashboard/Sidebar";
import Navbar from "@/app/_components/layouts/dashboard/Navbar";
import QueryProvider from "@/app/_components/ui/QueryProvider";
import { HQManagerGuard } from "@/app/components/AuthGuard";
import { MenuItem } from "@/app/types/routes";

export const metadata: Metadata = {
  title: {
    template: "%s | Kaytop App",
    default: "Welcome / HQ Manager Dashboard",
  },
  description:
    "Kaytop is a modern multipurpose investment platform that enables users to invest confidently, access financing, and grow wealth with ease.",
  icons: {
    icon: "/logo.png",
  },
};

const hqMenuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: "/dashboard.svg",
    link: "/dashboard/hq",
  },
  {
    label: "Branches",
    icon: "/branches.svg",
    link: "/dashboard/hq/branches",
  },
  {
    label: "Credit Officers",
    icon: "/credit.svg",
    link: "/dashboard/hq/credit-officers",
  },
  {
    label: "Customers",
    icon: "/customer.svg",
    link: "/dashboard/hq/customers",
  },
  {
    label: "Loans",
    icon: "/loans.svg",
    link: "/dashboard/hq/loans",
  },
  {
    label: "Reports",
    icon: "/report.svg",
    link: "/dashboard/hq/reports",
  },
  {
    label: "Settings",
    icon: "/settings.svg",
    link: "/dashboard/hq/settings",
  },
];

export default function HQManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F4F6FA] min-h-screen">
      <HQManagerGuard>
        <QueryProvider>
          <Navbar />
          <div className="drawer lg:drawer-open" style={{ paddingTop: '70px' }}>
            <input
              id="my-drawer-4"
              type="checkbox"
              className="drawer-toggle lg:hidden"
              aria-label="Toggle navigation drawer"
            />
            <Sidebar items={hqMenuItems} />
            {children}
          </div>
        </QueryProvider>
      </HQManagerGuard>
    </div>
  );
}
