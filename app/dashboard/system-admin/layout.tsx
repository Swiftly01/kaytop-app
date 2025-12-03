import { Metadata } from "next";
import React from "react";
import "../../styles/globals.css";

import Sidebar from "@/app/_components/layouts/dashboard/system-admin/Sidebar";
import Navbar from "@/app/_components/layouts/dashboard/Navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | Kaytop App",
    default: "Welcome / The System Admin Dashboard",
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
    <html lang="en" className="h-full">
      <body className=" bg-neutral-100">
        <Navbar />
        <div className="pt-16 drawer lg:drawer-open">
          <input
            id="my-drawer-4"
            type="checkbox"
            className="drawer-toggle lg:hidden"
          />
          <Sidebar />
          {children}
        </div>
      </body>
    </html>
  );
}
