"use client"
import useRequireAuth from "@/app/hooks/useRequireAuth";
import React from "react";
import QueryProvider from "../../QueryProvider";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth();
  return <QueryProvider>{children}</QueryProvider>;
}
