import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { WorkoutSessionResponse } from "./api";

export const workoutQueryKey = (workoutId: number): readonly ["workout", number] => [
  "workout",
  workoutId,
];

export const useWorkout = (
  workoutId: number | null,
  initialData: WorkoutSessionResponse | null,
): UseQueryResult<WorkoutSessionResponse | null, Error> => {
  return useQuery({
    queryKey: typeof workoutId === "number" ? workoutQueryKey(workoutId) : ["workout", "unknown"],
    queryFn: async () => initialData,
    enabled: false,
    initialData,
  });
};
