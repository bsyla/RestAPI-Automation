import { BaseApiClient, ApiResponse } from "../clients/BaseApiClient.js";
import { Project, ProjectListSchema, ProjectSchema } from "../models/project.js";
import { validateSchema } from "../utils/validation.js";

export class ProjectsService {
  constructor(private client: BaseApiClient) {}

  async createProject(payload: {
    name: string;
    color?: string;
    parentId?: string;
  }): Promise<ApiResponse<Project>> {
    const response = await this.client.request<Project>("POST", "/projects", {
      body: {
        name: payload.name,
        ...(payload.color ? { color: payload.color } : {}),
        ...(payload.parentId ? { parent_id: payload.parentId } : {}),
      },
    });

    response.data = validateSchema(
      ProjectSchema,
      response.data,
      "Create project response"
    );
    return response;
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    const response = await this.client.request<Project>(
      "GET",
      `/projects/${projectId}`
    );
    response.data = validateSchema(
      ProjectSchema,
      response.data,
      "Get project response"
    );
    return response;
  }

  async listProjects(): Promise<ApiResponse<Project[]>> {
    const response = await this.client.request<Project[]>("GET", "/projects");
    response.data = validateSchema(
      ProjectListSchema,
      response.data,
      "List projects response"
    );
    return response;
  }

  async updateProject(
    projectId: string,
    payload: { name?: string; color?: string }
  ): Promise<ApiResponse<Project>> {
    const response = await this.client.request<Project>(
      "POST",
      `/projects/${projectId}`,
      {
        body: {
          ...(payload.name ? { name: payload.name } : {}),
          ...(payload.color ? { color: payload.color } : {}),
        },
      }
    );

    response.data = validateSchema(
      ProjectSchema,
      response.data,
      "Update project response"
    );
    return response;
  }

  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    return this.client.request<void>("DELETE", `/projects/${projectId}`);
  }
}
