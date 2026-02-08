import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchExerciseLastMax, type ExerciseLastMaxResponse } from "./api";

export const exerciseLastMaxQueryKey = (
  exerciseId: number,
): readonly ["exercise-last-max", number] => ["exercise-last-max", exerciseId];

export const useExerciseLastMax = (
  exerciseId: number | null,
): UseQueryResult<ExerciseLastMaxResponse, Error> => {
  return useQuery({
    queryKey:
      typeof exerciseId === "number"
        ? exerciseLastMaxQueryKey(exerciseId)
        : ["exercise-last-max", "unknown"],
    queryFn: async () => {
      if (typeof exerciseId !== "number") {
        throw new Error("exerciseId обязателен для запроса last-max.");
      }

      return fetchExerciseLastMax(exerciseId);
    },
    enabled: typeof exerciseId === "number",
  });
};
