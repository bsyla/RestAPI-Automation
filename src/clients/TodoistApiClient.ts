import { getConfig } from "../config/env.js";
import { BaseApiClient, ClientOptions } from "./BaseApiClient.js";

export const createTodoistClient = (
  overrides: Partial<ClientOptions> = {}
) => {
  const config = getConfig();

  return new BaseApiClient({
    baseUrl: overrides.baseUrl ?? config.baseUrl,
    token: overrides.token ?? config.apiToken,
    timeoutMs: overrides.timeoutMs ?? config.timeoutMs,
    retry: overrides.retry ?? config.retry,
    httpLog: overrides.httpLog ?? config.httpLog,
  });
};
