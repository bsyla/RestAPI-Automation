export interface RetryInfo {
  attempt: number;
  delayMs: number;
  error: unknown;
}

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  shouldRetry: (error: unknown, attempt: number) => boolean;
  onRetry?: (info: RetryInfo) => void;
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const withRetry = async <T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions
) => {
  let attempt = 0;

  while (true) {
    try {
      return await operation(attempt);
    } catch (error) {
      if (attempt >= options.maxRetries || !options.shouldRetry(error, attempt)) {
        throw error;
      }

      const jitter = Math.floor(Math.random() * 100);
      const delayMs = options.baseDelayMs * 2 ** attempt + jitter;
      options.onRetry?.({ attempt: attempt + 1, delayMs, error });
      await sleep(delayMs);
      attempt += 1;
    }
  }
};
