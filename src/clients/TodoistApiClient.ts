import { getConfig } from "../config/env.js";
import { BaseApiClient, ClientOptions } from "./BaseApiClient.js";

export const createTodoistClient = (
  overrides: Partial<ClientOptions> = {}
) => {
  const config = getConfig();
  const hasTokenOverride = Object.prototype.hasOwnProperty.call(
    overrides,
    "token"
  );

  return new BaseApiClient({
    baseUrl: overrides.baseUrl ?? config.baseUrl,
    token: hasTokenOverride ? overrides.token : config.apiToken,
    timeoutMs: overrides.timeoutMs ?? config.timeoutMs,
    retry: overrides.retry ?? config.retry,
    httpLog: overrides.httpLog ?? config.httpLog,
  });
};
