import { request } from "../../../shared/api/http";
import type { components } from "../../../shared/api/schema";

export type ExerciseLastMaxResponse = components["schemas"]["ExerciseLastMaxResponse"];

export const fetchExerciseLastMax = async (
  exerciseId: number,
): Promise<ExerciseLastMaxResponse> => {
  return request<ExerciseLastMaxResponse>(`/api/exercises/${exerciseId}/last-max`);
};
