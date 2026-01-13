"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { removeAuthCookies, setAuthCookies } from "@/lib/authCookies";

interface AuthSession {
  token: string;
  role: string;
}

interface AuthContextType {
  session: AuthSession | null;
  login: (token: string, role: string) => void;
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
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on client-side only
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem("auth_session");
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
      }
    } catch (error) {
      console.error("Error loading auth session:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, role: string): void => {
    const newSession = { token, role };
    setSession(newSession);
    try {
      localStorage.setItem("auth_session", JSON.stringify(newSession));
    } catch (error) {
      console.error("Error saving auth session:", error);
    }
  };

  const logOut = (): void => {
    setSession(null);
    try {
      localStorage.removeItem("auth_session");
    } catch (error) {
      console.error("Error removing auth session:", error);
    }
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
