import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiRequest("/auth/me");
      setUser(response.user);
      return response.user;
    } catch (error) {
      if (error.status !== 401) {
        console.error("Authentication check failed:", error);
      }

      setUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  async function register(registrationData) {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: registrationData,
    });

    setUser(response.user);
    return response;
  }

  async function login(credentials) {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: credentials,
    });

    setUser(response.user);
    return response;
  }

  async function logout() {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } finally {
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      authLoading,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout,
      refreshUser,
    }),
    [user, authLoading, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}