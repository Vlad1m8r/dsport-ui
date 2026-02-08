import { request } from "../../../shared/api/http";
import type { components } from "../../../shared/api/schema";

export type AddWorkoutExerciseRequest = components["schemas"]["AddWorkoutExerciseRequest"];
export type WorkoutExerciseResponse = components["schemas"]["WorkoutExerciseResponse"];
export type AddSetEntryRequest = components["schemas"]["AddSetEntryRequest"];
export type SetEntryResponse = components["schemas"]["SetEntryResponse"];

export const addExercise = async (
  workoutId: number,
  payload: AddWorkoutExerciseRequest,
): Promise<WorkoutExerciseResponse> => {
  return request<WorkoutExerciseResponse>(`/api/workouts/${workoutId}/exercises`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const deleteExercise = async (
  workoutId: number,
  workoutExerciseId: number,
): Promise<void> => {
  return request<void>(`/api/workouts/${workoutId}/exercises/${workoutExerciseId}`, {
    method: "DELETE",
  });
};

export const addSetEntry = async (
  workoutId: number,
  workoutExerciseId: number,
  payload: AddSetEntryRequest,
): Promise<SetEntryResponse> => {
  return request<SetEntryResponse>(
    `/api/workouts/${workoutId}/exercises/${workoutExerciseId}/sets`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
};

export const deleteSetEntry = async (
  workoutId: number,
  workoutExerciseId: number,
  setEntryId: number,
): Promise<void> => {
  return request<void>(
    `/api/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setEntryId}`,
    {
      method: "DELETE",
    },
  );
};
