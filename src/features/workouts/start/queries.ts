import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import {
  startWorkout,
  type StartWorkoutRequest,
  type WorkoutSessionResponse,
} from "./api";

export const useStartWorkout = (): UseMutationResult<
  WorkoutSessionResponse,
  Error,
  StartWorkoutRequest
> => {
  return useMutation({
    mutationFn: startWorkout,
  });
};
