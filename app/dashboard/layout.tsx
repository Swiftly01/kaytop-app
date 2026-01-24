import { Metadata } from "next";
import React from "react";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    template: "%s | Kaytop App Dashboard",
    default: "Dashboard | Kaytop App",
  },
  description: "Kaytop App Dashboard - Secure access to your financial management tools",
  robots: {
    index: false,
    follow: false,
  },
};

// Force all dashboard routes to be dynamic (no static generation)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}