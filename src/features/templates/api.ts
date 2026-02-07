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

type TemplatesListPayload = TemplatesListResponse | TemplatesListResponse[];

const normalizeTemplatesResponse = (
  response: TemplatesListPayload,
): TemplateResponse[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (response) {
    return [response];
  }

  return [];
};

export const listTemplates = async (): Promise<TemplateResponse[]> => {
  const response = await request<TemplatesListPayload>("/api/templates");
  return normalizeTemplatesResponse(response);
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
