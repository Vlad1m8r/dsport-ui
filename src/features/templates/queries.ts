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
  fetchTemplates,
  type TemplateCreateRequest,
  type TemplateResponse,
  type TemplatesListResponse,
} from "./api";

export const templatesQueryKey = ["templates"] as const;

export const useTemplatesQuery = (): UseQueryResult<TemplatesListResponse, Error> => {
  return useQuery({
    queryKey: templatesQueryKey,
    queryFn: fetchTemplates,
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
