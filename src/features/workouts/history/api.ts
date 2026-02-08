import { request } from "../../../shared/api/http";
import type { components, paths } from "../../../shared/api/schema";

export type WorkoutSummaryResponse = components["schemas"]["WorkoutSummaryResponse"];
export type WorkoutsListResponse =
  paths["/api/workouts"]["get"]["responses"][200]["content"]["*/*"];
export type WorkoutsListParams =
  NonNullable<paths["/api/workouts"]["get"]["parameters"]["query"]>;

const buildQueryParams = (params?: WorkoutsListParams): string => {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  if (typeof params.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }

  if (typeof params.offset === "number") {
    searchParams.set("offset", String(params.offset));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const fetchWorkouts = async (
  params?: WorkoutsListParams,
): Promise<WorkoutsListResponse> => {
  const queryString = buildQueryParams(params);
  return request<WorkoutsListResponse>(`/api/workouts${queryString}`);
};
