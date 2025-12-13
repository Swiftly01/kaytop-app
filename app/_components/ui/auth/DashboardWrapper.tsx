"use client"
import useRequireAuth from "@/app/hooks/useRequireAuth";
import React from "react";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth();
  return <>{children}</>;
}
