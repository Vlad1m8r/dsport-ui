import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchWorkouts, type WorkoutsListParams, type WorkoutsListResponse } from "./api";

export const workoutsQueryKey = (
  params?: WorkoutsListParams,
): readonly ["workouts", { limit?: number; offset?: number }] => [
  "workouts",
  {
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
