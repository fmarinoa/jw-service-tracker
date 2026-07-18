import { AuthTokenStorage } from '../storage/authTokens';

export const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

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
    const path = request.path.startsWith('/')
      ? request.path.slice(1)
      : request.path;
    const url = new URL(path, baseUrl);
    if (request.queryParams) {
      Object.entries(request.queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: request.method || 'GET',
        headers: { ...(await this.getHeaders()), ...request.headers },
        body: request.body ? JSON.stringify(request.body) : undefined,
      });
    } catch (e) {
      console.warn('Network request failed in baseApi:', e);
      throw new NetworkError();
    }

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
