import type { Context } from "mocha";

import { ProjectsService } from "../../services/ProjectsService.js";
import { dataFactory } from "../../utils/dataFactory.js";
import { attachApiCall } from "../../utils/reporting.js";

export const createProjectFixture = async (
  context: Context,
  projects: ProjectsService
) => {
  const response = await projects.createProject({
    name: dataFactory.projectName(),
  });
  attachApiCall(context, response);

  return {
    project: response.data,
    cleanup: async () => {
      try {
        await projects.deleteProject(response.data.id);
      } catch {
        // Best-effort cleanup
      }
    },
  };
};
