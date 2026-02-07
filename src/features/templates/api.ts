import { request } from "../../shared/api/http";
import type { components, paths } from "../../shared/api/schema";

export type TemplateResponse = components["schemas"]["TemplateResponse"];
export type TemplateCreateRequest = components["schemas"]["TemplateCreateRequest"];
export type TemplatesListResponse = paths["/api/templates"]["get"]["responses"][200]["content"]["*/*"];

export const fetchTemplates = async (): Promise<TemplatesListResponse> => {
  return request<TemplatesListResponse>("/api/templates");
};

export const createTemplate = async (
  payload: TemplateCreateRequest,
): Promise<TemplateResponse> => {
  return request<TemplateResponse>("/api/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const deleteTemplate = async (id: number): Promise<void> => {
  return request<void>(`/api/templates/${id}`, {
    method: "DELETE",
  });
};
