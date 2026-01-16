import { Metadata } from "next";
import React from "react";
import "../../styles/globals.css";

import Sidebar from "@/app/_components/layouts/dashboard/Sidebar";
import Navbar from "@/app/_components/layouts/dashboard/Navbar";
import DashboardWrapper from "@/app/_components/ui/auth/DashboardWrapper";
import { Toaster } from "react-hot-toast";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="en" className="">
      <div className=" bg-neutral-100">
        <Navbar />
        <div className="pt-16 drawer lg:drawer-open">
          <input
            id="my-drawer-4"
            type="checkbox"
            className="drawer-toggle lg:hidden"
          />
          <Sidebar />
          <DashboardWrapper>{children}</DashboardWrapper>
          <Toaster position="top-right" />
        </div>
      </div>
    </div>
  );
}
