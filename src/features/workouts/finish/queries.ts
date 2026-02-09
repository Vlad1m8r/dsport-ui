import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { finishWorkout, type WorkoutSessionResponse } from "./api";
import { workoutQueryKey } from "../view/queries";

export const useFinishWorkout = (
  workoutId: number | null,
): UseMutationResult<WorkoutSessionResponse, Error, void> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["finishWorkout", workoutId],
    mutationFn: () => {
      if (typeof workoutId !== "number") {
        return Promise.reject(new Error("Некорректный идентификатор тренировки."));
      }

      return finishWorkout(workoutId);
    },
    onSuccess: async () => {
      if (typeof workoutId !== "number") {
        return;
      }
      await queryClient.invalidateQueries({ queryKey: workoutQueryKey(workoutId) });
      navigate("/workouts");
    },
  });
};
