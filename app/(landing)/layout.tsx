import React from "react";
import Navbar from "../_components/layouts/Navbar";
import Footer from "../_components/layouts/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
