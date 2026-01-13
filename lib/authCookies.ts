import Cookies from "js-cookie";

/**
 * Convert API role format to middleware expected format
 */
export function convertRoleForMiddleware(role: string): string {
  if (!role) return 'USER';

  const normalizedRole = role.toLowerCase().trim();

  const roleMap: Record<string, string> = {
    'system_admin': 'ADMIN',
    'system admin': 'ADMIN',
    'systemadmin': 'ADMIN',
    'admin': 'ADMIN',
    'administrator': 'ADMIN',
    'hq_manager': 'ADMIN',
    'hq manager': 'ADMIN',
    'hqmanager': 'ADMIN',
    'hq': 'ADMIN',
    'headquarters_manager': 'ADMIN',

    'branch_manager': 'BRANCH_MANAGER',
    'branchmanager': 'BRANCH_MANAGER',
    'manager': 'BRANCH_MANAGER',

    'account_manager': 'ACCOUNT_MANAGER',
    'accountmanager': 'ACCOUNT_MANAGER',
    'am': 'ACCOUNT_MANAGER',

    'credit_officer': 'CREDIT_OFFICER',
    'creditofficer': 'CREDIT_OFFICER',
    'co': 'CREDIT_OFFICER',

    'customer': 'USER',
    'user': 'USER'
  };

  return roleMap[normalizedRole] || 'USER';
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
