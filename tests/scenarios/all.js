/**
 * Full suite runner: Projects then Tasks, each in its own describe so before() and executionVariables are isolated.
 * Use for npm run test:all. Individual suites (projectCRUD.js, taskCRUD.js) stay runnable for test:projects / test:tasks.
 */
import {
  createProjectSetup,
  getProject,
  updateCreatedProject,
  deleteCreatedProject,
  createProjectWithoutName,
  updateProjectWithIncorrectColour,
  getAllProjects,
} from "../steps/project.js";
import {
  createTaskSetup,
  getTask,
  updateTask,
  closeTask,
  createTaskWithoutContent,
} from "../steps/task.js";

describe("Projects suite", () => {
  before(async function () {
    global.executionVariables = {};
    await createProjectSetup(this);
  });

  describe("[NEGATIVE]", () => {
    createProjectWithoutName();
    updateProjectWithIncorrectColour();
  });

  describe("[POSITIVE]", () => {
    getProject();
    updateCreatedProject();
    getProject();
    getAllProjects();
    deleteCreatedProject();
  });
});

describe("Tasks suite", () => {
  before(async function () {
    global.executionVariables = {};
    await createProjectSetup(this);
    await createTaskSetup(this);
  });

  describe("[NEGATIVE]", () => {
    createTaskWithoutContent();
  });

  describe("[POSITIVE]", () => {
    getTask();
    updateTask();
    getTask();
    closeTask();
  });
});
