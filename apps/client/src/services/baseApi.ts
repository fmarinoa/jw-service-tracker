import { Platform } from 'react-native';

import { AuthTokenStorage } from '../storage/authTokens';

export const API_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api',
  default: typeof window !== 'undefined' && window.location
    ? (process.env.NODE_ENV === 'production' ? `${window.location.origin}/api` : 'http://localhost:3000/api')
    : 'http://localhost:3000/api',
});

export interface RequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: object;
  headers?: HeadersInit;
  queryParams?: Record<string, string | number | boolean>;
}

export abstract class BaseService {
  protected static async getHeaders(): Promise<HeadersInit> {
    const token = await AuthTokenStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  protected static async handleRequest<T>(request: RequestOptions): Promise<T> {
    const baseUrl = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;
    const path = request.path.startsWith('/') ? request.path.slice(1) : request.path;
    const url = new URL(path, baseUrl);
    if (request.queryParams) {
      Object.entries(request.queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: request.method || 'GET',
      headers: { ...(await this.getHeaders()), ...request.headers },
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Request failed');
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return response.json();
  }
}
