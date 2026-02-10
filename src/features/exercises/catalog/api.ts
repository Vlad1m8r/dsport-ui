import { request } from "../../../shared/api/http";
import type { paths } from "../../../shared/api/schema";

export type ExercisesCatalogResponse =
  paths["/api/exercises"]["get"]["responses"][200]["content"]["*/*"];
export type MuscleGroupsResponse =
  paths["/api/muscle-groups"]["get"]["responses"][200]["content"]["*/*"];

export const fetchExercisesCatalog = async (): Promise<ExercisesCatalogResponse> => {
  return request<ExercisesCatalogResponse>("/api/exercises");
};

export const fetchMuscleGroups = async (): Promise<MuscleGroupsResponse> => {
  return request<MuscleGroupsResponse>("/api/muscle-groups");
};
