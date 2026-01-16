import React from "react";
import "../styles/globals.css";
import patterns from "@/public/patterns.png";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: {
    template: "%s | Kaytop App",
    default: "Welcome / The Kaytop App",
  },
  description:
    "Kaytop is a modern multipurpose investment platform that enables users to invest confidently, access financing, and grow wealth with ease.",
  // metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
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
      <body
        style={{ backgroundImage: `url(${patterns.src})` }}
        className="flex items-center justify-center min-h-screen bg-no-repeat bg-bottom-right bg-neutral-100"
      >
        <AuthProvider>{children}</AuthProvider>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
