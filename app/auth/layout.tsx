import React from "react";
import "../styles/globals.css";
import patterns from "@/public/patterns.png";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        style={{ backgroundImage: `url(${patterns.src})` }}
        className="flex items-center justify-center min-h-screen bg-no-repeat bg-bottom-right bg-bg"
      >
        {children}
      </body>
    </html>
  );
}
