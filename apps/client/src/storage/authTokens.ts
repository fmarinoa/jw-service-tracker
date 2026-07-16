import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const isWeb = Platform.OS === "web";

const webStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};

export class AuthTokenStorage {
  static async getAccessToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return webStorage.getItem(ACCESS_TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static async setAccessToken(token: string): Promise<void> {
    try {
      if (isWeb) {
        webStorage.setItem(ACCESS_TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch (e) {
      console.error("Failed to save access token", e);
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return webStorage.getItem(REFRESH_TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static async setRefreshToken(token: string): Promise<void> {
    try {
      if (isWeb) {
        webStorage.setItem(REFRESH_TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (e) {
      console.error("Failed to save refresh token", e);
    }
  }

  static async clearTokens(): Promise<void> {
    try {
      if (isWeb) {
        webStorage.removeItem(ACCESS_TOKEN_KEY);
        webStorage.removeItem(REFRESH_TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.error("Failed to clear tokens", e);
    }
  }
}
