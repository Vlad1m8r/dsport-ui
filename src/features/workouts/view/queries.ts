import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchWorkout, type WorkoutSessionResponse } from "./api";

export const workoutQueryKey = (workoutId: number): readonly ["workout", number] => [
  "workout",
  workoutId,
];

export const useWorkout = (
  workoutId: number | null,
): UseQueryResult<WorkoutSessionResponse, Error> => {
  return useQuery({
    queryKey: typeof workoutId === "number" ? workoutQueryKey(workoutId) : ["workout", "unknown"],
    queryFn: () => fetchWorkout(workoutId as number),
    enabled: typeof workoutId === "number",
  });
};
