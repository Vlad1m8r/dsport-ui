import { request } from "../../../shared/api/http";
import type { components } from "../../../shared/api/schema";

export type StartWorkoutRequest = components["schemas"]["StartWorkoutRequest"];
export type WorkoutSessionResponse = components["schemas"]["WorkoutSessionResponse"];

export const startWorkout = async (
  payload: StartWorkoutRequest,
): Promise<WorkoutSessionResponse> => {
  return request<WorkoutSessionResponse>("/api/workouts/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
