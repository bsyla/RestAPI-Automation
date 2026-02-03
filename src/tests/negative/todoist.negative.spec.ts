import { requireApiToken } from "../../config/env.js";
import { createTodoistClient } from "../../clients/TodoistApiClient.js";
import { ProjectsService } from "../../services/ProjectsService.js";
import { TasksService } from "../../services/TasksService.js";
import { ErrorResponseSchema } from "../../models/error.js";
import { dataFactory } from "../../utils/dataFactory.js";
import { expectApiError } from "../../utils/assertions.js";
import { createProjectFixture } from "../fixtures/projectFixture.js";

describe("Todoist API negative scenarios", function () {
  let projects: ProjectsService;
  let tasks: TasksService;
  let unauthProjects: ProjectsService;
  let cleanupProject: (() => Promise<void>) | undefined;
  let projectId: string | undefined;

  const ensureProjectId = () => {
    if (!projectId) {
      throw new Error("Project fixture was not initialized.");
    }
    return projectId;
  };

  before(async function () {
    requireApiToken();
    const authenticatedClient = createTodoistClient();
    const unauthenticatedClient = createTodoistClient({ token: undefined });

    projects = new ProjectsService(authenticatedClient);
    tasks = new TasksService(authenticatedClient);
    unauthProjects = new ProjectsService(unauthenticatedClient);

    const fixture = await createProjectFixture(this, projects);
    projectId = fixture.project.id;
    cleanupProject = fixture.cleanup;
  });

  after(async () => {
    if (cleanupProject) {
      await cleanupProject();
    }
  });

  const cases = () => [
    {
      name: "returns 401 when auth token is missing",
      action: () => unauthProjects.listProjects(),
      status: 401,
    },
    {
      name: "returns 404 for non-existent project",
      action: () => projects.getProject(dataFactory.invalidId()),
      status: 404,
    },
    {
      name: "returns 400 when project name is empty",
      action: () => projects.createProject({ name: "" }),
      status: 400,
    },
    {
      name: "returns 400 when task content is empty",
      action: () =>
        tasks.createTask({ content: "", projectId: ensureProjectId() }),
      status: 400,
    },
    {
      name: "returns 404 when task id is unknown",
      action: () => tasks.closeTask(dataFactory.invalidId()),
      status: 404,
    },
  ];

  cases().forEach((testCase) => {
    it(testCase.name, async function () {
      await expectApiError(testCase.action, {
        status: testCase.status,
        schema: ErrorResponseSchema,
        context: this,
      });
    });
  });
});
