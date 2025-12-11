"use client"
import { createContext, useContext } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorage";


interface AuthContextType {
  session: {token: string} | null;
  login: (token: string, role: string) => void;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, setSession] = useLocalStorageState<{token: string, role: string} | null>(null, "auth_session");

  const login = (token: string, role: string): void => {
    setSession({ token, role });
  };

  const logOut = (): void => {
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, logOut }}>
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
