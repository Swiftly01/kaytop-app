import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./lib/utils";

const roleDashboardRoutes: Record<string, string> = {
  BRANCH_MANAGER: ROUTES.Bm.DASHBOARD,
  ADMIN: "/dashboard/admin",
  USER: "/dashboard/customer",
  CREDIT_OFFICER: "/dashboard/agent",
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const currentPath = request.nextUrl.pathname;



  if (!token) {
    if (currentPath.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL(ROUTES.Bm.Auth.LOGIN, request.url));
    }

    return NextResponse.next();
  }

  if (token && role) {
    const targetDashboard = roleDashboardRoutes[role.toUpperCase()];

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
