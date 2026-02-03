import { z } from "zod";

const DueSchema = z
  .object({
    date: z.string().optional(),
    datetime: z.string().optional(),
    timezone: z.string().nullable().optional(),
    string: z.string().optional(),
  })
  .partial();

export const TaskSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  content: z.string(),
  description: z.string().optional(),
  is_completed: z.boolean(),
  labels: z.array(z.string()).optional(),
  priority: z.number().optional(),
  url: z.string().url(),
  due: DueSchema.nullable().optional(),
});

export const TaskListSchema = z.array(TaskSchema);

export type Task = z.infer<typeof TaskSchema>;
