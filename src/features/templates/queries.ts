import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  createTemplate,
  deleteTemplate,
  fetchTemplate,
  fetchTemplates,
  updateTemplate,
  type TemplateByIdResponse,
  type TemplateCreateRequest,
  type TemplateResponse,
  type TemplateUpdateRequest,
  type TemplateUpdateResponse,
  type TemplatesListResponse,
} from "./api";

export const templatesQueryKey = ["templates"] as const;
export const templateQueryKey = (templateId: number): readonly ["template", number] => [
  "template",
  templateId,
];

export const useTemplatesQuery = (): UseQueryResult<TemplatesListResponse, Error> => {
  return useQuery({
    queryKey: templatesQueryKey,
    queryFn: fetchTemplates,
  });
};

export const useTemplateQuery = (
  templateId: number | null,
): UseQueryResult<TemplateByIdResponse, Error> => {
  return useQuery({
    queryKey:
      typeof templateId === "number" ? templateQueryKey(templateId) : ["template", "unknown"],
    queryFn: () => {
      if (typeof templateId !== "number") {
        return Promise.reject(new Error("Некорректный идентификатор шаблона."));
      }

      return fetchTemplate(templateId);
    },
    enabled: typeof templateId === "number",
  });
};

export const useCreateTemplateMutation = (): UseMutationResult<
  TemplateResponse,
  Error,
  TemplateCreateRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templatesQueryKey });
    },
  });
};

export const useDeleteTemplateMutation = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templatesQueryKey });
    },
  });
};

interface UpdateTemplateMutationPayload {
  templateId: number;
  payload: TemplateUpdateRequest;
}

export const useUpdateTemplateMutation = (): UseMutationResult<
  TemplateUpdateResponse,
  Error,
  UpdateTemplateMutationPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, payload }: UpdateTemplateMutationPayload) => {
      return updateTemplate(templateId, payload);
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: templatesQueryKey }),
        queryClient.invalidateQueries({ queryKey: templateQueryKey(variables.templateId) }),
      ]);
    },
  });
};
