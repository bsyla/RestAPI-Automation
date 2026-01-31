import {
  createProjectSetup,
  getProject,
  updateCreatedProject,
  deleteCreatedProject,
  createProjectWithoutName,
  updateProjectWithIncorrectColour,
  getAllProjects,
} from "../steps/project.js";

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
