import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
  parent_id: z.string().nullable().optional(),
  order: z.number().optional(),
  comment_count: z.number().optional(),
  is_shared: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  url: z.string().url().optional(),
  view_style: z.string().optional(),
});

export const ProjectListSchema = z.array(ProjectSchema);

export type Project = z.infer<typeof ProjectSchema>;
