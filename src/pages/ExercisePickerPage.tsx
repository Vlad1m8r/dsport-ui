import type { ReactElement } from "react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ExercisePicker } from "../features/exercises/catalog/ExercisePicker";

type PickerMode = "template" | "workout";

const isPickerMode = (value: string | null): value is PickerMode => {
  return value === "template" || value === "workout";
};

const getSafeReturnPath = (returnTo: string | null): string => {
  if (!returnTo || !returnTo.startsWith("/")) {
    return "/templates";
  }

  return returnTo;
};

const buildReturnUrl = (returnTo: string, exerciseId: number, mode: PickerMode | null): string => {
  const [pathname, queryString] = returnTo.split("?");
  const searchParams = new URLSearchParams(queryString ?? "");

  searchParams.set("pickedExerciseId", String(exerciseId));

  if (mode) {
    searchParams.set("mode", mode);
  }

  const serializedParams = searchParams.toString();

  if (serializedParams.length === 0) {
    return pathname;
  }

  return `${pathname}?${serializedParams}`;
};

export const ExercisePickerPage = (): ReactElement => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const modeParam = searchParams.get("mode");
  const returnToParam = searchParams.get("returnTo");

  const mode = isPickerMode(modeParam) ? modeParam : null;
  const returnTo = useMemo<string>(() => getSafeReturnPath(returnToParam), [returnToParam]);

  const handleSelectExercise = (exerciseId: number): void => {
    navigate(buildReturnUrl(returnTo, exerciseId, mode));
  };

  return <ExercisePicker mode={mode} onSelectExercise={handleSelectExercise} />;
};
