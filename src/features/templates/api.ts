import type { components, paths } from "../../shared/api/schema";
import { request } from "../../shared/api/http";

type TemplateCreateRequest = components["schemas"]["TemplateCreateRequest"];
type TemplateResponse = components["schemas"]["TemplateResponse"];
type TemplatesListResponse =
  paths["/api/templates"]["get"]["responses"][200]["content"]["*/*"];
type TemplateCreateResponse =
  paths["/api/templates"]["post"]["responses"][201]["content"]["*/*"];
type TemplateId =
  paths["/api/templates/{id}"]["delete"]["parameters"]["path"]["id"];

export const listTemplates = async (): Promise<TemplateResponse> => {
  return request<TemplatesListResponse>("/api/templates", {
    method: "GET",
  });
};

export const createTemplate = async (
  payload: TemplateCreateRequest,
): Promise<TemplateCreateResponse> => {
  return request<TemplateCreateResponse>("/api/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const deleteTemplate = async (id: TemplateId): Promise<void> => {
  await request<void>(`/api/templates/${id}`, {
    method: "DELETE",
  });
};
