import { createRequire } from "module";
import { faker } from "@faker-js/faker";

const require = createRequire(import.meta.url);
const taskTemplate = require("../../data/tasks/create_task.json");

/**
 * Generates a task request body with Faker content. project_id must be set by caller.
 */
export function generateTaskRequestBody(projectId) {
  const body = {
    ...taskTemplate,
    content: faker.lorem.sentence({ min: 3, max: 8 }),
    project_id: projectId,
  };
  return body;
}
