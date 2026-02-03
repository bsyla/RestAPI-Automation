import { expect } from "chai";
import type { Context } from "mocha";
import { z } from "zod";

import { ApiError } from "../clients/BaseApiClient.js";
import { attachApiError } from "./reporting.js";
import { validateSchema } from "./validation.js";

export const expectApiError = async (
  action: () => Promise<unknown>,
  options: {
    status: number;
    schema?: z.ZodSchema<unknown>;
    context?: Context;
  }
) => {
  try {
    await action();
    throw new Error("Expected API error, but request succeeded.");
  } catch (error) {
    expect(error).to.be.instanceOf(ApiError);
    const apiError = error as ApiError;

    expect(apiError.status).to.equal(options.status);
    if (options.schema) {
      expect(apiError.data, "error response body").to.not.equal(undefined);
      validateSchema(options.schema, apiError.data, "Error response");
    }

    if (options.context) {
      attachApiError(options.context, apiError);
    }

    return apiError;
  }
};
