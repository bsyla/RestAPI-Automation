import { z } from "zod";

export const ErrorResponseSchema = z.union([
  z.object({
    error: z.string(),
  }),
  z.string(),
]);

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
