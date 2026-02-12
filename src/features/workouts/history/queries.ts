import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import {
  fetchWorkouts,
  type WorkoutsListParams,
  type WorkoutsListResponse,
} from "./api";

export const workoutsQueryKey = (
  params?: WorkoutsListParams,
): readonly ["workouts", WorkoutsListParams] => [
  "workouts",
  {
    status: params?.status,
    limit: params?.limit,
    offset: params?.offset,
  },
];

export const useWorkouts = (
  params?: WorkoutsListParams,
): UseQueryResult<WorkoutsListResponse, Error> => {
  return useQuery({
    queryKey: workoutsQueryKey(params),
    queryFn: () => fetchWorkouts(params),
  });
};

export const useActiveWorkout = (): UseQueryResult<number | null, Error> => {
  return useQuery({
    queryKey: workoutsQueryKey({ status: "IN_PROGRESS", limit: 1, offset: 0 }),
    queryFn: async () => {
      const workouts = await fetchWorkouts({ status: "IN_PROGRESS", limit: 1, offset: 0 });
      const workoutId = workouts[0]?.id;

      return typeof workoutId === "number" ? workoutId : null;
    },
  });
};
