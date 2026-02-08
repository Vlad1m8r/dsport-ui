import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import {
  addExercise,
  addSetEntry,
  deleteExercise,
  deleteSetEntry,
  type AddSetEntryRequest,
  type AddWorkoutExerciseRequest,
  type SetEntryResponse,
  type WorkoutExerciseResponse,
} from "./api";
import { workoutQueryKey } from "../view/queries";

export type AddExerciseVariables = {
  workoutId: number;
  payload: AddWorkoutExerciseRequest;
};

export type DeleteExerciseVariables = {
  workoutId: number;
  workoutExerciseId: number;
};

export type AddSetEntryVariables = {
  workoutId: number;
  workoutExerciseId: number;
  payload: AddSetEntryRequest;
};

export type DeleteSetEntryVariables = {
  workoutId: number;
  workoutExerciseId: number;
  setEntryId: number;
};

export const useAddExerciseMutation = (): UseMutationResult<
  WorkoutExerciseResponse,
  Error,
  AddExerciseVariables
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutId, payload }) => addExercise(workoutId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: workoutQueryKey(variables.workoutId) });
    },
  });
};

export const useDeleteExerciseMutation = (): UseMutationResult<
  void,
  Error,
  DeleteExerciseVariables
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutId, workoutExerciseId }) =>
      deleteExercise(workoutId, workoutExerciseId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: workoutQueryKey(variables.workoutId) });
    },
  });
};

export const useAddSetEntryMutation = (): UseMutationResult<
  SetEntryResponse,
  Error,
  AddSetEntryVariables
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutId, workoutExerciseId, payload }) =>
      addSetEntry(workoutId, workoutExerciseId, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: workoutQueryKey(variables.workoutId) });
    },
  });
};

export const useDeleteSetEntryMutation = (): UseMutationResult<
  void,
  Error,
  DeleteSetEntryVariables
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutId, workoutExerciseId, setEntryId }) =>
      deleteSetEntry(workoutId, workoutExerciseId, setEntryId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: workoutQueryKey(variables.workoutId) });
    },
  });
};
