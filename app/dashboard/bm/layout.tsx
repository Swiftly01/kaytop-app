import { Metadata } from "next";
import React from "react";
import "../../styles/globals.css";

import Sidebar from "@/app/_components/layouts/dashboard/Sidebar";
import Navbar from "@/app/_components/layouts/dashboard/Navbar";
import DashboardWrapper from "@/app/_components/ui/auth/DashboardWrapper";
import { Toaster } from "react-hot-toast";
import { MenuItem } from "@/app/types/routes";
import { ROUTES } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    template: "%s | Kaytop App",
    default: "Welcome / The BM Dashboard",
  },
  description:
    "Kaytop is a modern multipurpose investment platform that enables users to invest confidently, access financing, and grow wealth with ease.",
  icons: {
    icon: "/logo.png",
  },
};

const data: MenuItem[] = [
  {
    icon: "/dashboard.svg",
    label: "Dashboard",
    link: ROUTES.Bm.DASHBOARD,
    exact: true,
  },
  { icon: "/credit.svg", label: "Credit Officers", link: ROUTES.Bm.CREDIT },
  { icon: "/credit.svg", label: "Customers", link: ROUTES.Bm.CUSTOMERS },
  { icon: "/loans.svg", label: "Loans", link: ROUTES.Bm.LOAN },
  { icon: "/report.svg", label: "Reports", link: ROUTES.Bm.REPORT },
  { icon: "/settings.svg", label: "Settings", link: ROUTES.Bm.SETTING },
];


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <body className=" bg-neutral-100">
        <Navbar />
        <div className="pt-16 drawer lg:drawer-open">
          <input
            id="my-drawer-4"
            type="checkbox"
            className="drawer-toggle lg:hidden"
          />
          <Sidebar data={data} />
          <DashboardWrapper>{children}</DashboardWrapper>
          <Toaster position="top-right" />
        </div>
      </body>
    </html>
  );
}
