/**
 * Load .env first so process.env is populated (optional: use .env file + dotenv).
 * Copy to config.js; prefer .env or env vars so no secrets live in code.
 */
import "dotenv/config";

/**
 * REST API v2 base URL from official docs: https://developer.todoist.com/rest/v2/
 * Default: https://api.todoist.com/rest/v2 (override with TODOIST_BASE_URL).
 */
const DEFAULT_BASE_URL = "https://api.todoist.com/rest/v2";

const apiKey = (process.env.TODOIST_API_KEY || "").trim();
if (!apiKey) {
  throw new Error(
    "TODOIST_API_KEY is required. Set it in .env (e.g. TODOIST_API_KEY=your-token) or in the environment. " +
      "Get a token: https://app.todoist.com/app/settings/integrations"
  );
}

export const config = {
  PROD: {
    host: (process.env.TODOIST_BASE_URL || DEFAULT_BASE_URL).trim(),
    apiKey,
  },
};

if (typeof globalThis !== "undefined") {
  globalThis.executionVariables = globalThis.executionVariables ?? {};
}
