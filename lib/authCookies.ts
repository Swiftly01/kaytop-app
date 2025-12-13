import Cookies from "js-cookie";

export function setAuthCookies(token: string, role: string) {
  Cookies.set("token", token, {
    expires: 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  Cookies.set("role", role, {
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
