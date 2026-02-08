import { request } from "../../../shared/api/http";
import type { components } from "../../../shared/api/schema";

export type WorkoutSessionResponse = components["schemas"]["WorkoutSessionResponse"];
export type WorkoutsListResponse = WorkoutSessionResponse[];

export type WorkoutsListParams = {
  limit?: number;
  offset?: number;
};

export const fetchWorkouts = async (
  params?: WorkoutsListParams,
): Promise<WorkoutsListResponse> => {
  const searchParams = new URLSearchParams();

  if (typeof params?.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }

  if (typeof params?.offset === "number") {
    searchParams.set("offset", String(params.offset));
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/api/workouts?${queryString}` : "/api/workouts";

  return request<WorkoutsListResponse>(path);
};
