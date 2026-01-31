import { generateTaskRequestBody } from "../utils/generateRequestBody/generateTaskBody.js";
import { request } from "../utils/requests.js";

/** Setup-only: creates a task in the current project and stores taskID/taskContent. Use after createProjectSetup. */
export async function createTaskSetup(context) {
  const projectId = global.executionVariables["projectID"];
  const requestBody = generateTaskRequestBody(projectId);
  await request(context, "POST", "/tasks", requestBody, true, {
    statusCode: 200,
    expectedValues: [
      { path: "content", value: requestBody.content },
      { path: "project_id", value: projectId },
    ],
    executionVariables: [
      { path: "id", name: "taskID" },
      { path: "content", name: "taskContent" },
    ],
    expectedTypes: [
      { path: "id", type: "string" },
      { path: "content", type: "string" },
      { path: "project_id", type: "string" },
    ],
  });
}

export async function getTask() {
  it("Get task", async function () {
    await request(
      this,
      "GET",
      `/tasks/${global.executionVariables["taskID"]}`,
      undefined,
      true,
      {
        statusCode: 200,
        expectedValues: [
          { path: "id", value: global.executionVariables["taskID"] },
          { path: "content", value: global.executionVariables["taskContent"] },
          { path: "project_id", value: global.executionVariables["projectID"] },
        ],
        expectedTypes: [
          { path: "id", type: "string" },
          { path: "content", type: "string" },
          { path: "project_id", type: "string" },
        ],
      }
    );
  });
}

export async function updateTask() {
  it("Update task", async function () {
    const projectId = global.executionVariables["projectID"];
    const requestBody = generateTaskRequestBody(projectId);
    await request(
      this,
      "POST",
      `/tasks/${global.executionVariables["taskID"]}`,
      { content: requestBody.content },
      true,
      {
        statusCode: 200,
        expectedValues: [{ path: "content", value: requestBody.content }],
        executionVariables: [
          { path: "id", name: "taskID" },
          { path: "content", name: "taskContent" },
        ],
        expectedTypes: [
          { path: "id", type: "string" },
          { path: "content", type: "string" },
        ],
      }
    );
  });
}

export async function closeTask() {
  it("Close task", async function () {
    await request(
      this,
      "POST",
      `/tasks/${global.executionVariables["taskID"]}/close`,
      undefined,
      true,
      { statusCode: 204 }
    );
  });
}

export async function createTaskWithoutContent() {
  it("[NEGATIVE] - Create task without content", async function () {
    const requestBody = {
      content: "",
      project_id: global.executionVariables["projectID"],
    };
    await request(this, "POST", "/tasks", requestBody, true, {
      statusCode: 400,
    });
  });
}
