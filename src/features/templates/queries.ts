import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import type { components, paths } from "../../shared/api/schema";
import { createTemplate, deleteTemplate, listTemplates } from "./api";

type TemplateResponse = components["schemas"]["TemplateResponse"];
type TemplateCreateRequest = components["schemas"]["TemplateCreateRequest"];
type TemplateId =
  paths["/api/templates/{id}"]["delete"]["parameters"]["path"]["id"];

const templatesQueryKey = ["templates"] as const;

export const useTemplates = (): UseQueryResult<TemplateResponse[], Error> => {
  return useQuery({
    queryKey: templatesQueryKey,
    queryFn: listTemplates,
  });
};

export const useCreateTemplate = (): UseMutationResult<
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

export const useDeleteTemplate = (): UseMutationResult<
  void,
  Error,
  TemplateId
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templatesQueryKey });
    },
  });
};
