import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./lib/utils";

const roleDashboardRoutes: Record<string, string> = {
  // Uppercase versions for backward compatibility
  BRANCH_MANAGER: ROUTES.Bm.DASHBOARD,
  SYSTEM_ADMIN: "/dashboard/system-admin",
  ACCOUNT_MANAGER: "/dashboard/am",
  ADMIN: "/dashboard/admin",
  USER: "/dashboard/customer",
  CREDIT_OFFICER: "/dashboard/agent",
  // Lowercase underscore versions (actual format from backend)
  branch_manager: ROUTES.Bm.DASHBOARD,
  system_admin: "/dashboard/system-admin",
  account_manager: "/dashboard/am",
  admin: "/dashboard/admin",
  customer: "/dashboard/customer",
  credit_officer: "/dashboard/agent",
};

export const getDashboardRouteByRole = (role?: string) =>
  role ? roleDashboardRoutes[role] ?? "/" : "/";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const currentPath = request.nextUrl.pathname;

  if (!token) {
    if (currentPath.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL(ROUTES.Auth.LOGIN, request.url));
    }

    return NextResponse.next();
  }

  if (token && role) {
    // Try exact role match first, then uppercase version
    const targetDashboard = roleDashboardRoutes[role] || roleDashboardRoutes[role.toUpperCase()];

    if (
      targetDashboard &&
      currentPath.startsWith("/dashboard") &&
      !currentPath.startsWith(targetDashboard)
    ) {
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
