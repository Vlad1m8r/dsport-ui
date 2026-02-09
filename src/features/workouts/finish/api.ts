import { request } from "../../../shared/api/http";
import type { components } from "../../../shared/api/schema";

export type WorkoutSessionResponse = components["schemas"]["WorkoutSessionResponse"];

export const finishWorkout = async (workoutId: number): Promise<WorkoutSessionResponse> => {
  return request<WorkoutSessionResponse>(`/api/workouts/${workoutId}/finish`, {
    method: "POST",
  });
};
