import React from "react";
import "../styles/globals.css";
import patterns from "@/public/patterns.png";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    template: "%s | Kaytop App",
    default: "Welcome / The Kaytop App",
  },
  description:
    "Kaytop is a modern multipurpose investment platform that enables users to invest confidently, access financing, and grow wealth with ease.",
  icons: {
    icon: "/logo.png",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ backgroundImage: `url(${patterns.src})` }}
      className="flex items-center justify-center min-h-screen bg-no-repeat bg-bottom-right bg-neutral-100"
    >
      {children}
      <Toaster position="top-right" />
    </div>
  );
}
