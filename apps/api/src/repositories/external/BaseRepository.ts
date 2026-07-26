import { InternalServerErrorException } from '@nestjs/common';
import { DateTime } from 'luxon';

export interface BaseRepositoryProps {
  config: {
    urlBase: string;
  };
}

export interface PayloadRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string | number | boolean>;
}

export interface HandlerOptions {
  functionName?: string;
  fastFail?: boolean;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

class HttpRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export abstract class BaseRepository {
  constructor(private readonly baseProps: BaseRepositoryProps) {}

  protected async handlerHttpRequest<T = unknown>(
    payload: PayloadRequest,
    options: HandlerOptions = {},
  ): Promise<T | Response> {
    const {
      functionName,
      fastFail = true,
      timeoutMs = 10_000,
      retries = 0,
      retryDelayMs = 300,
    } = options;

    const urlBase = this.baseProps.config.urlBase;
    if (!urlBase) {
      throw new InternalServerErrorException(
        'URL base is not defined in the repository configuration.',
      );
    }

    const headers = {
      'Content-Type': 'application/json',
      ...payload.headers,
    };
    const body =
      payload.body !== undefined ? JSON.stringify(payload.body) : undefined;
    const fullUrl = `${urlBase}${payload.url}${this.buildQueryString(payload.queryParams)}`;
    const tag = functionName ? `${urlBase} (${functionName})` : '';

    for (let attempt = 0; ; attempt++) {
      const start = Date.now();
      const timeoutController = new AbortController();
      const timeoutHandle = setTimeout(
        () => timeoutController.abort(),
        timeoutMs,
      );

      try {
        const response = await fetch(fullUrl, {
          method: payload.method,
          headers,
          body,
          signal: timeoutController.signal,
        });

        const duration = Date.now() - start;

        if (!response.ok) {
          if (fastFail) {
            throw new HttpRequestError(
              response.status,
              `HTTP request failed with status ${response.status}: ${response.statusText}`,
            );
          }
          console.log(
            `[HTTP Request]${tag} - completed in ${duration}ms (status ${response.status}, fastFail off)`,
          );
          return response;
        }

        console.log(`[HTTP Request]${tag} - completed in ${duration}ms`);
        return await this.parseResponseBody<T>(response);
      } catch (error) {
        const duration = Date.now() - start;
        console.error(
          `[HTTP Request Error]${tag} - failed in ${duration}ms (attempt ${attempt + 1}${retries ? `/${retries + 1}` : ''}): `,
          error instanceof Error ? error.message : String(error),
        );

        if (attempt < retries && this.isRetryableHttpError(error)) {
          await this.delay(retryDelayMs * 2 ** attempt);
          continue;
        }

        throw new InternalServerErrorException(
          '[HTTP Request Error]' +
            (error instanceof Error ? error.message : String(error)),
          { cause: error },
        );
      } finally {
        clearTimeout(timeoutHandle);
      }
    }
  }

  private buildQueryString(
    queryParams?: Record<string, string | number | boolean>,
  ): string {
    if (!queryParams) {
      return '';
    }
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      search.append(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
  }

  private async parseResponseBody<T>(response: Response): Promise<T> {
    const contentLength =
      response.headers?.get?.('content-length') ??
      (response.headers as any)?.['content-length'];
    if (response.status === 204 || contentLength === '0') {
      return undefined as T;
    }
    const contentType =
      response.headers?.get?.('content-type') ??
      (response.headers as any)?.['content-type'] ??
      '';
    if (
      contentType.includes('application/json') ||
      (!contentType && typeof response.json === 'function')
    ) {
      return (await response.json()) as T;
    }
    if (typeof response.text === 'function') {
      return (await response.text()) as unknown as T;
    }
    return response as unknown as T;
  }

  private isRetryableHttpError(error: unknown): boolean {
    if (error instanceof HttpRequestError) {
      return error.status >= 500 || error.status === 429;
    }
    if (error instanceof Error) {
      return error.name === 'AbortError' || error.name === 'TypeError';
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected getTimestamp() {
    return DateTime.now().toMillis();
  }
}
