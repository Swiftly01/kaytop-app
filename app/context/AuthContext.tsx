"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorage";
import { removeAuthCookies, setAuthCookies } from "@/lib/authCookies";


interface AuthContextType {
  session: { token: string; role: string; firstName?: string; lastName?: string } | null;
  login: (token: string, role: string, firstName?: string, lastName?: string) => void;
  logOut: () => void;
  setCookie: (token: string, role: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, setSession] = useLocalStorageState<{
    token: string;
    role: string;
    firstName?: string;
    lastName?: string;
  } | null>(null, "auth_session");

  const [isLoading, setIsLoading] = useState(true);

  // Handle hydration by waiting for client-side mount
  useEffect(() => {
    // Small delay to ensure localStorage has been read
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const login = (token: string, role: string, firstName?: string, lastName?: string): void => {
    setSession({ token, role, firstName, lastName });
  };

  const logOut = (): void => {
    setSession(null);
    removeAuthCookies();
  };

  const setCookie = (token: string, role: string): void => {
    setAuthCookies(token, role);
  };

  return (
    <AuthContext.Provider value={{ session, login, logOut, setCookie, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("AuthContext was used outside of AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
