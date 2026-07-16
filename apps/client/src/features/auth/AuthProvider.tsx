import type { UserDto } from "@jw-tracker/shared";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { AuthApi } from "../../services/authApi";
import { AuthTokenStorage } from "../../storage/authTokens";

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
  login: (phone: string, password: string) => Promise<UserDto>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const refreshToken = await AuthTokenStorage.getRefreshToken();
      if (!refreshToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Try refreshing the access token
      const refreshRes = await AuthApi.refresh(refreshToken);
      await AuthTokenStorage.setAccessToken(refreshRes.accessToken);
      await AuthTokenStorage.setRefreshToken(refreshRes.refreshToken);

      // Fetch user identity
      const userProfile = await AuthApi.me(refreshRes.accessToken);
      setUser(userProfile);
    } catch (e) {
      console.warn("Failed to resume session", e);
      await AuthTokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthApi.login({ phone, password });
      await AuthTokenStorage.setAccessToken(res.accessToken);
      await AuthTokenStorage.setRefreshToken(res.refreshToken);
      const userProfile = await AuthApi.me(res.accessToken);
      setUser(userProfile);
      return userProfile;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Error durante el inicio de sesión";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refreshToken = await AuthTokenStorage.getRefreshToken();
      if (refreshToken) {
        await AuthApi.logout(refreshToken).catch(() => {});
      }
    } finally {
      await AuthTokenStorage.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
