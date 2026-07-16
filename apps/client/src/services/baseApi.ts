import { AuthTokenStorage } from "../storage/authTokens";
import { Platform } from "react-native";

export const API_URL = Platform.select({
  ios: "http://localhost:3000",
  android: "http://10.0.2.2:3000",
  default: "http://localhost:3000",
});

export interface RequestOptions {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: object;
  headers?: HeadersInit;
  queryParams?: Record<string, string | number | boolean>;
}

export abstract class BaseService {
  protected static async getHeaders(): Promise<HeadersInit> {
    const token = await AuthTokenStorage.getAccessToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  protected static async handleRequest<T>(request: RequestOptions): Promise<T> {
    const url = new URL(request.path, API_URL);
    if (request.queryParams) {
      Object.entries(request.queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: request.method || "GET",
      headers: { ... (await this.getHeaders()), ...request.headers },
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Request failed");
    }
    return response.json();
  }
}