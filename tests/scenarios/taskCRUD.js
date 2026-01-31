import { createProjectSetup } from "../steps/project.js";
import {
  createTaskSetup,
  getTask,
  updateTask,
  closeTask,
  createTaskWithoutContent,
} from "../steps/task.js";

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
