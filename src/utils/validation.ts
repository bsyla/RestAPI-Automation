import { z } from "zod";

export const validateSchema = <T>(
  schema: z.ZodSchema<T>,
  payload: unknown,
  context?: string
) => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const prefix = context ? `Schema validation failed: ${context}. ` : "";
    throw new Error(`${prefix}${result.error.message}`);
  }
  return result.data;
};
