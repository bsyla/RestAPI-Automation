import { expect } from "chai";

import { requireApiToken } from "../../config/env.js";
import { createTodoistClient } from "../../clients/TodoistApiClient.js";
import { ProjectsService } from "../../services/ProjectsService.js";
import { TasksService } from "../../services/TasksService.js";
import { dataFactory } from "../../utils/dataFactory.js";
import { attachApiCall, attachApiError } from "../../utils/reporting.js";
import { ApiError } from "../../clients/BaseApiClient.js";

describe("Todoist workflow - project and task lifecycle", function () {
  let projects: ProjectsService;
  let tasks: TasksService;
  let existingProjectId: string | undefined;

  before(async function () {
    requireApiToken();
    const client = createTodoistClient();
    projects = new ProjectsService(client);
    tasks = new TasksService(client);

    const listResponse = await projects.listProjects();
    attachApiCall(this, listResponse);
    existingProjectId = listResponse.data[0]?.id;
    if (!existingProjectId) {
      throw new Error("No projects available for task workflow.");
    }
  });

  it("manages the project lifecycle when allowed", async function () {
    const projectName = dataFactory.projectName();
    const updatedProjectName = dataFactory.projectName();

    let projectId: string | undefined;

    try {
      const projectResponse = await projects.createProject({
        name: projectName,
      });
      attachApiCall(this, projectResponse);
      projectId = projectResponse.data.id;
      expect(projectResponse.data.name).to.equal(projectName);

      const updatedProjectResponse = await projects.updateProject(projectId, {
        name: updatedProjectName,
      });
      attachApiCall(this, updatedProjectResponse);
      expect(updatedProjectResponse.data.name).to.equal(updatedProjectName);

      const listResponse = await projects.listProjects();
      attachApiCall(this, listResponse);
      expect(listResponse.data.map((project) => project.id)).to.include(
        projectId
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        attachApiError(this, error);
        this.skip();
        return;
      }
      throw error;
    } finally {
      if (projectId) {
        await projects.deleteProject(projectId).catch(() => undefined);
      }
    }
  });

  it("manages the task lifecycle in an existing project", async function () {
    if (!existingProjectId) {
      throw new Error("No project available for task workflow.");
    }

    const taskContent = dataFactory.taskContent();
    const updatedTaskContent = dataFactory.taskContent();

    let taskId: string | undefined;

    try {
      const taskResponse = await tasks.createTask({
        content: taskContent,
        projectId: existingProjectId,
      });
      attachApiCall(this, taskResponse);
      taskId = taskResponse.data.id;
      expect(taskResponse.data.project_id).to.equal(existingProjectId);
      expect(taskResponse.data.content).to.equal(taskContent);

      const updatedTaskResponse = await tasks.updateTask(taskId, {
        content: updatedTaskContent,
      });
      attachApiCall(this, updatedTaskResponse);
      expect(updatedTaskResponse.data.content).to.equal(updatedTaskContent);

      const getTaskResponse = await tasks.getTask(taskId);
      attachApiCall(this, getTaskResponse);
      expect(getTaskResponse.data.content).to.equal(updatedTaskContent);

      const closeResponse = await tasks.closeTask(taskId);
      attachApiCall(this, closeResponse);
      expect(closeResponse.status).to.equal(204);

      const deleteTaskResponse = await tasks.deleteTask(taskId);
      attachApiCall(this, deleteTaskResponse);
      expect(deleteTaskResponse.status).to.equal(204);
      taskId = undefined;
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        attachApiError(this, error);
        this.skip();
        return;
      }
      throw error;
    } finally {
      if (taskId) {
        await tasks.deleteTask(taskId).catch(() => undefined);
      }
    }
  });
});
