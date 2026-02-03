import { expect } from "chai";

import { requireApiToken } from "../../config/env.js";
import { createTodoistClient } from "../../clients/TodoistApiClient.js";
import { ProjectsService } from "../../services/ProjectsService.js";
import { TasksService } from "../../services/TasksService.js";
import { dataFactory } from "../../utils/dataFactory.js";
import { attachApiCall } from "../../utils/reporting.js";

describe("Todoist workflow - project and task lifecycle", function () {
  let projects: ProjectsService;
  let tasks: TasksService;

  before(() => {
    requireApiToken();
    const client = createTodoistClient();
    projects = new ProjectsService(client);
    tasks = new TasksService(client);
  });

  it("creates, updates, completes, and deletes a task", async function () {
    const projectName = dataFactory.projectName();
    const updatedProjectName = dataFactory.projectName();
    const taskContent = dataFactory.taskContent();
    const updatedTaskContent = dataFactory.taskContent();

    let projectId: string | undefined;
    let taskId: string | undefined;

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

      const taskResponse = await tasks.createTask({
        content: taskContent,
        projectId,
      });
      attachApiCall(this, taskResponse);
      taskId = taskResponse.data.id;
      expect(taskResponse.data.project_id).to.equal(projectId);
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

      const deleteProjectResponse = await projects.deleteProject(projectId);
      attachApiCall(this, deleteProjectResponse);
      expect(deleteProjectResponse.status).to.equal(204);
      projectId = undefined;
    } finally {
      if (taskId) {
        await tasks.deleteTask(taskId).catch(() => undefined);
      }
      if (projectId) {
        await projects.deleteProject(projectId).catch(() => undefined);
      }
    }
  });
});
