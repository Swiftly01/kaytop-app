import "./styles/globals.css"; 

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased z-40`}
      >
        {children}
      </body>
    </html>
  );
}
