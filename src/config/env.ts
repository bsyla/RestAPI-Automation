import dotenv from "dotenv";

dotenv.config();

export type Environment = "dev" | "staging" | "prod";

const DEFAULT_BASE_URLS: Record<Environment, string> = {
  dev: "https://api.todoist.com/rest/v2",
  staging: "https://api.todoist.com/rest/v2",
  prod: "https://api.todoist.com/rest/v2",
};

const rawEnv = process.env.TODOIST_ENV ?? "prod";
const env: Environment = ["dev", "staging", "prod"].includes(rawEnv)
  ? (rawEnv as Environment)
  : "prod";

const toPositiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const config = {
  env,
  baseUrl: process.env.TODOIST_BASE_URL ?? DEFAULT_BASE_URLS[env],
  apiToken: process.env.TODOIST_API_TOKEN,
  httpLog: process.env.HTTP_LOG === "true",
  timeoutMs: toPositiveNumber(process.env.REQUEST_TIMEOUT_MS, 10000),
  retry: {
    maxRetries: toPositiveNumber(process.env.RETRY_MAX, 2),
    baseDelayMs: toPositiveNumber(process.env.RETRY_DELAY_MS, 300),
  },
};

export type EnvConfig = typeof config;

export const getConfig = () => config;

export const requireApiToken = () => {
  if (!config.apiToken) {
    throw new Error(
      "TODOIST_API_TOKEN is required. Set it in your .env file or CI secrets."
    );
  }
  return config.apiToken;
};
