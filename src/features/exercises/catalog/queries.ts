import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import {
  fetchExercisesCatalog,
  fetchMuscleGroups,
  type ExercisesCatalogResponse,
  type MuscleGroupsResponse,
} from "./api";

export const exercisesCatalogQueryKey = ["exercises", "catalog"] as const;
export const muscleGroupsQueryKey = ["muscle-groups"] as const;

export const useExercisesCatalog = (): UseQueryResult<ExercisesCatalogResponse, Error> => {
  return useQuery({
    queryKey: exercisesCatalogQueryKey,
    queryFn: fetchExercisesCatalog,
  });
};

export const useMuscleGroups = (): UseQueryResult<MuscleGroupsResponse, Error> => {
  return useQuery({
    queryKey: muscleGroupsQueryKey,
    queryFn: fetchMuscleGroups,
  });
};
