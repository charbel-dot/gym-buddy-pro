import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateCredentials: (newUsername?: string, newPassword?: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "gym-auth";
const CRED_KEY = "gym-credentials";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(AUTH_KEY) === "true";
  });

  const getCredentials = () => {
    try {
      const raw = localStorage.getItem(CRED_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignored
    }
    return { username: "admin", password: "admin" };
  };

  const login = useCallback((username: string, password: string) => {
    const creds = getCredentials();
    if (username === creds.username && password === creds.password) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const updateCredentials = useCallback((newUsername?: string, newPassword?: string) => {
    const creds = getCredentials();
    const updated = {
      username: newUsername || creds.username,
      password: newPassword || creds.password,
    };
    localStorage.setItem(CRED_KEY, JSON.stringify(updated));
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
