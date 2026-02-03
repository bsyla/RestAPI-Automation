import { buildUrl, sanitizeHeaders, toHeadersRecord } from "../utils/http.js";
import { HttpLogger } from "../utils/logger.js";
import { withRetry } from "../utils/retry.js";

export interface ApiRequestInfo {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface ApiResponse<T> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
  request: ApiRequestInfo;
  durationMs: number;
}

export interface ClientRetryOptions {
  maxRetries: number;
  baseDelayMs: number;
}

export interface ClientOptions {
  baseUrl: string;
  token?: string;
  timeoutMs?: number;
  retry?: ClientRetryOptions;
  httpLog?: boolean;
}

export interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  retry?: boolean;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: unknown;
  headers?: Record<string, string>;
  request: ApiRequestInfo;

  constructor(message: string, options: { status: number; statusText: string; data?: unknown; headers?: Record<string, string>; request: ApiRequestInfo }) {
    super(message);
    this.status = options.status;
    this.statusText = options.statusText;
    this.data = options.data;
    this.headers = options.headers;
    this.request = options.request;
  }
}

const isRetryableStatus = (status: number) =>
  [0, 408, 429, 500, 502, 503, 504].includes(status);

export class BaseApiClient {
  private baseUrl: string;
  private token?: string;
  private timeoutMs: number;
  private retry: ClientRetryOptions;
  private logger: HttpLogger;

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl;
    this.token = options.token;
    this.timeoutMs = options.timeoutMs ?? 10000;
    this.retry = options.retry ?? { maxRetries: 0, baseDelayMs: 0 };
    this.logger = new HttpLogger(Boolean(options.httpLog));
  }

  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(this.baseUrl, path, options.query);
    const hasBody = options.body !== undefined;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const requestInfo: ApiRequestInfo = {
      method,
      url,
      headers,
      body: options.body,
    };

    const executeRequest = async () => {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(
        () => controller.abort(),
        options.timeoutMs ?? this.timeoutMs
      );
      const startedAt = Date.now();

      try {
        this.logger.logRequest({
          ...requestInfo,
          headers: sanitizeHeaders(headers),
        });

        const response = await fetch(url, {
          method,
          headers,
          body: hasBody ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        const durationMs = Date.now() - startedAt;
        const responseHeaders = toHeadersRecord(response.headers);
        let responseBody: unknown = undefined;

        if (response.status !== 204) {
          const contentType = response.headers.get("content-type") ?? "";
          if (contentType.includes("application/json")) {
            responseBody = await response.json();
          } else {
            responseBody = await response.text();
          }
        }

        const apiResponse: ApiResponse<T> = {
          status: response.status,
          statusText: response.statusText,
          data: responseBody as T,
          headers: responseHeaders,
          request: requestInfo,
          durationMs,
        };

        this.logger.logResponse({
          status: apiResponse.status,
          statusText: apiResponse.statusText,
          durationMs,
          headers: responseHeaders,
          body: responseBody,
        });

        if (!response.ok) {
          throw new ApiError(
            `Request failed with status ${response.status}`,
            {
              status: response.status,
              statusText: response.statusText,
              data: responseBody,
              headers: responseHeaders,
              request: requestInfo,
            }
          );
        }

        return apiResponse;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }

        const isTimeout =
          error instanceof Error && error.name === "AbortError";
        const status = isTimeout ? 408 : 0;
        const statusText = isTimeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR";

        throw new ApiError(
          isTimeout ? "Request timed out" : "Network error",
          {
            status,
            statusText,
            request: requestInfo,
          }
        );
      } finally {
        clearTimeout(timeoutHandle);
      }
    };

    const shouldRetry = (error: unknown) =>
      error instanceof ApiError && isRetryableStatus(error.status);

    if (options.retry === false || this.retry.maxRetries <= 0) {
      return executeRequest();
    }

    return withRetry(executeRequest, {
      maxRetries: this.retry.maxRetries,
      baseDelayMs: this.retry.baseDelayMs,
      shouldRetry,
      onRetry: ({ attempt, delayMs, error }) => {
        const reason =
          error instanceof ApiError
            ? `${error.status} ${error.statusText}`
            : "unknown error";
        this.logger.logRetry({ attempt, delayMs, reason });
      },
    });
  }
}
