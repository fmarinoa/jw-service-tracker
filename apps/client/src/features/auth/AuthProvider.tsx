import type { UserDto } from '@jw-tracker/shared';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { AuthApi } from '../../services/authApi';
import { NetworkError } from '../../services/baseApi';
import { OfflineSyncService } from '../../services/offlineSync';
import { UserApi } from '../../services/userApi';
import { AuthTokenStorage } from '../../storage/authTokens';
import { OfflineStorage } from '../../storage/offlineStorage';

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
      const isOffline = await OfflineSyncService.isOffline();
      if (isOffline) {
        const cachedUser = await OfflineStorage.getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);
          setIsLoading(false);
          return;
        }
      }

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
      const userProfile = await UserApi.getProfile();
      setUser(userProfile);
      await OfflineStorage.setCachedUser(userProfile);
    } catch (e) {
      console.warn('Failed to resume session', e);
      const isNetworkErr =
        e instanceof NetworkError ||
        (e instanceof Error &&
          (e.name === 'NetworkError' ||
            e.message.includes('Network request failed') ||
            e.message.includes('Failed to fetch') ||
            e.message.includes('offline') ||
            e.message.includes('Internet connection'))) ||
        (await OfflineSyncService.isOffline());

      if (isNetworkErr) {
        const cachedUser = await OfflineStorage.getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);
          setIsLoading(false);
          return;
        }
      }
      await OfflineStorage.clearCache();
      await OfflineSyncService.clearQueue();
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
      const isOffline = await OfflineSyncService.isOffline();
      if (isOffline) {
        const cachedUser = await OfflineStorage.getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);
          return cachedUser;
        }
        throw new NetworkError(
          'No hay conexión a internet para iniciar sesión.',
        );
      }
      const res = await AuthApi.login({ phone, password });
      await AuthTokenStorage.setAccessToken(res.accessToken);
      await AuthTokenStorage.setRefreshToken(res.refreshToken);
      const userProfile = await UserApi.getProfile();
      setUser(userProfile);
      await OfflineStorage.setCachedUser(userProfile);
      return userProfile;
    } catch (e) {
      console.warn('Failed to login', e);
      const isNetworkErr =
        e instanceof NetworkError ||
        (e instanceof Error &&
          (e.name === 'NetworkError' ||
            e.message.includes('Network request failed') ||
            e.message.includes('Failed to fetch') ||
            e.message.includes('offline') ||
            e.message.includes('Internet connection'))) ||
        (await OfflineSyncService.isOffline());

      if (isNetworkErr) {
        const cachedUser = await OfflineStorage.getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);
          return cachedUser;
        }
      }

      const msg = isNetworkErr
        ? 'No hay conexión a internet. No se puede iniciar sesión.'
        : e instanceof Error
          ? e.message
          : 'Error durante el inicio de sesión';
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
      await OfflineStorage.clearCache();
      await OfflineSyncService.clearQueue();
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
