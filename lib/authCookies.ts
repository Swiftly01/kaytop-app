import Cookies from "js-cookie";

/**
 * Convert API role format to middleware expected format
 */
function convertRoleForMiddleware(role: string): string {
  const roleMap: Record<string, string> = {
    'system_admin': 'ADMIN',
    'branch_manager': 'BRANCH_MANAGER',
    'account_manager': 'ACCOUNT_MANAGER',
    'hq_manager': 'ADMIN',
    'credit_officer': 'CREDIT_OFFICER',
    'customer': 'USER',
  };
  
  return roleMap[role] || 'USER';
}

export function setAuthCookies(token: string, role: string) {
  // Convert role to middleware expected format
  const middlewareRole = convertRoleForMiddleware(role);
  
  console.log('🔍 setAuthCookies - Original role:', role);
  console.log('🔍 setAuthCookies - Middleware role:', middlewareRole);
  
  Cookies.set("token", token, {
    expires: 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  Cookies.set("role", middlewareRole, {
    expires: 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function removeAuthCookies() {
  Cookies.remove("token");
  Cookies.remove("role");
}
