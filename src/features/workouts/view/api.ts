import { request } from "../../../shared/api/http";
import type { components, paths } from "../../../shared/api/schema";

export type WorkoutSessionResponse = components["schemas"]["WorkoutSessionResponse"];
export type WorkoutResponse =
  paths["/api/workouts/{workoutId}"]["get"]["responses"][200]["content"]["*/*"];

export const fetchWorkout = async (workoutId: number): Promise<WorkoutResponse> => {
  return request<WorkoutResponse>(`/api/workouts/${workoutId}`);
};
