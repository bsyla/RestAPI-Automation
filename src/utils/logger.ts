export interface HttpRequestLog {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface HttpResponseLog {
  status: number;
  statusText: string;
  durationMs: number;
  headers: Record<string, string>;
  body?: unknown;
}

export interface HttpRetryLog {
  attempt: number;
  delayMs: number;
  reason: string;
}

export class HttpLogger {
  constructor(private enabled: boolean) {}

  logRequest(details: HttpRequestLog) {
    if (!this.enabled) {
      return;
    }
    console.log(`[HTTP] ${details.method} ${details.url}`);
    console.log(
      JSON.stringify(
        {
          headers: details.headers,
          body: details.body,
        },
        null,
        2
      )
    );
  }

  logResponse(details: HttpResponseLog) {
    if (!this.enabled) {
      return;
    }
    console.log(
      `[HTTP] ${details.status} ${details.statusText} (${details.durationMs}ms)`
    );
    console.log(
      JSON.stringify(
        {
          headers: details.headers,
          body: details.body,
        },
        null,
        2
      )
    );
  }

  logRetry(details: HttpRetryLog) {
    if (!this.enabled) {
      return;
    }
    console.log(
      `[HTTP] retry ${details.attempt} in ${details.delayMs}ms: ${details.reason}`
    );
  }
}
