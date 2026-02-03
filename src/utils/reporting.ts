import addContext from "mochawesome/addContext.js";
import type { Context } from "mocha";

import { ApiError, ApiResponse } from "../clients/BaseApiClient.js";
import { sanitizeHeaders } from "./http.js";

export const attachApiCall = <T>(context: Context, response: ApiResponse<T>) => {
  addContext(context, `${response.request.method} ${response.request.url}`);
  addContext(context, {
    title: "REQUEST",
    value: {
      headers: sanitizeHeaders(response.request.headers),
      body: response.request.body,
    },
  });
  addContext(context, {
    title: "RESPONSE",
    value: {
      status: response.status,
      statusText: response.statusText,
      durationMs: response.durationMs,
      headers: response.headers,
      body: response.data,
    },
  });
};

export const attachApiError = (context: Context, error: ApiError) => {
  addContext(context, `${error.request.method} ${error.request.url}`);
  addContext(context, {
    title: "REQUEST",
    value: {
      headers: sanitizeHeaders(error.request.headers),
      body: error.request.body,
    },
  });
  addContext(context, {
    title: "ERROR RESPONSE",
    value: {
      status: error.status,
      statusText: error.statusText,
      headers: error.headers,
      body: error.data,
    },
  });
};
