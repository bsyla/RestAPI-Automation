import { BaseApiClient, ApiResponse } from "../clients/BaseApiClient.js";
import { Task, TaskListSchema, TaskSchema } from "../models/task.js";
import { validateSchema } from "../utils/validation.js";

export class TasksService {
  constructor(private client: BaseApiClient) {}

  async createTask(payload: {
    content: string;
    projectId?: string;
    description?: string;
    priority?: number;
  }): Promise<ApiResponse<Task>> {
    const response = await this.client.request<Task>("POST", "/tasks", {
      body: {
        content: payload.content,
        ...(payload.projectId ? { project_id: payload.projectId } : {}),
        ...(payload.description ? { description: payload.description } : {}),
        ...(payload.priority ? { priority: payload.priority } : {}),
      },
    });

    response.data = validateSchema(
      TaskSchema,
      response.data,
      "Create task response"
    );
    return response;
  }

  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    const response = await this.client.request<Task>(
      "GET",
      `/tasks/${taskId}`
    );
    response.data = validateSchema(
      TaskSchema,
      response.data,
      "Get task response"
    );
    return response;
  }

  async listTasks(projectId?: string): Promise<ApiResponse<Task[]>> {
    const response = await this.client.request<Task[]>("GET", "/tasks", {
      query: projectId ? { project_id: projectId } : undefined,
    });
    response.data = validateSchema(
      TaskListSchema,
      response.data,
      "List tasks response"
    );
    return response;
  }

  async updateTask(
    taskId: string,
    payload: { content?: string; description?: string; priority?: number }
  ): Promise<ApiResponse<Task>> {
    const response = await this.client.request<Task>(
      "POST",
      `/tasks/${taskId}`,
      {
        body: {
          ...(payload.content ? { content: payload.content } : {}),
          ...(payload.description ? { description: payload.description } : {}),
          ...(payload.priority ? { priority: payload.priority } : {}),
        },
      }
    );

    response.data = validateSchema(
      TaskSchema,
      response.data,
      "Update task response"
    );
    return response;
  }

  async closeTask(taskId: string): Promise<ApiResponse<void>> {
    return this.client.request<void>("POST", `/tasks/${taskId}/close`);
  }

  async deleteTask(taskId: string): Promise<ApiResponse<void>> {
    return this.client.request<void>("DELETE", `/tasks/${taskId}`);
  }
}
