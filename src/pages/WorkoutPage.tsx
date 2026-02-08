import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  useAddExerciseMutation,
  useAddSetEntryMutation,
  useDeleteExerciseMutation,
  useDeleteSetEntryMutation,
} from "../features/workouts/edit/queries";
import type {
  SetEntryResponse,
  WorkoutExerciseResponse,
} from "../features/workouts/edit/api";
import type { WorkoutSessionResponse } from "../features/workouts/view/api";
import { useWorkout, workoutQueryKey } from "../features/workouts/view/queries";
import { useExerciseLastMax } from "../features/exercises/stats/queries";

import "./WorkoutPage.css";

type WorkoutLocationState = {
  workout?: WorkoutSessionResponse;
};

type SetDraft = {
  reps: number | null;
  weight: number | null;
  durationSeconds: number | null;
};

type SetDraftMap = Record<string, SetDraft>;

type ExerciseCardProps = {
  workoutExercise: WorkoutExerciseResponse;
  setDrafts: SetDraftMap;
  onChangeSetValue: (setKey: string, field: keyof SetDraft, value: string) => void;
  onAddSet: (workoutExerciseId: number, nextOrderIndex: number) => void;
  onDeleteSet: (workoutExerciseId: number, setEntryId: number) => void;
  onDeleteExercise: (workoutExerciseId: number) => void;
};

const formatDateTime = (value?: string): string => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("ru-RU");
};

const formatNumber = (value?: number | null): string => {
  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

const getSetKey = (
  workoutExerciseId: number | undefined,
  setEntry: SetEntryResponse,
  fallbackIndex: number,
): string => {
  if (typeof setEntry.id === "number") {
    return `set-${setEntry.id}`;
  }

  return `set-${workoutExerciseId ?? "exercise"}-${setEntry.orderIndex ?? fallbackIndex}`;
};

const getNextOrderIndex = (items: Array<{ orderIndex?: number }> | undefined): number => {
  const maxIndex = (items ?? []).reduce((currentMax, item) => {
    if (typeof item.orderIndex === "number") {
      return Math.max(currentMax, item.orderIndex);
    }
    return currentMax;
  }, 0);

  return maxIndex + 1;
};

const ExerciseCard = ({
  workoutExercise,
  setDrafts,
  onChangeSetValue,
  onAddSet,
  onDeleteSet,
  onDeleteExercise,
}: ExerciseCardProps): ReactElement => {
  const exerciseId = workoutExercise.exerciseId ?? null;
  const lastMaxQuery = useExerciseLastMax(typeof exerciseId === "number" ? exerciseId : null);
  const lastMax = lastMaxQuery.data;

  const lastMaxText = useMemo(() => {
    if (!lastMax) {
      return null;
    }

    if (typeof lastMax.maxWeight === "number") {
      return `Прошлый раз: max ${lastMax.maxWeight} кг`;
    }

    if (typeof lastMax.maxDurationSeconds === "number") {
      return `Прошлый раз: max ${lastMax.maxDurationSeconds} сек`;
    }

    return null;
  }, [lastMax]);

  const sortedSets = useMemo(() => {
    const sets = workoutExercise.sets ? [...workoutExercise.sets] : [];
    sets.sort((left, right) => {
      const leftIndex = left.orderIndex ?? 0;
      const rightIndex = right.orderIndex ?? 0;
      return leftIndex - rightIndex;
    });
    return sets;
  }, [workoutExercise.sets]);

  const workoutExerciseId = workoutExercise.id;
  const nextSetOrderIndex = getNextOrderIndex(workoutExercise.sets);
  const exerciseTitle =
    typeof workoutExercise.exerciseId === "number"
      ? `Exercise #${workoutExercise.exerciseId}`
      : "Exercise";

  return (
    <article className="workout-card">
      <header className="workout-card__header">
        <div>
          <h2 className="workout-card__title">{exerciseTitle}</h2>
          {lastMaxText ? <p className="workout-card__hint">{lastMaxText}</p> : null}
          {lastMaxQuery.isLoading ? (
            <p className="workout-card__hint">Загрузка last-max...</p>
          ) : null}
          {lastMaxQuery.isError ? (
            <p className="workout-card__hint">Не удалось загрузить last-max.</p>
          ) : null}
        </div>
        <button
          type="button"
          className="workout-card__ghost-button"
          onClick={() => {
            if (typeof workoutExerciseId === "number") {
              onDeleteExercise(workoutExerciseId);
            }
          }}
          disabled={typeof workoutExerciseId !== "number"}
        >
          Удалить упражнение
        </button>
      </header>

      {sortedSets.length === 0 ? <p>Подходов пока нет.</p> : null}

      {sortedSets.map((setEntry, index) => {
        const setKey = getSetKey(workoutExerciseId, setEntry, index);
        const draft = setDrafts[setKey];
        const repsValue = formatNumber(draft?.reps ?? setEntry.reps ?? null);
        const weightValue = formatNumber(draft?.weight ?? setEntry.weight ?? null);
        const durationValue = formatNumber(
          draft?.durationSeconds ?? setEntry.durationSeconds ?? null,
        );

        return (
          <div key={setKey} className="workout-card__set">
            <div className="workout-card__set-header">
              <span className="workout-card__set-title">
                Подход {setEntry.orderIndex ?? index + 1}
              </span>
              <button
                type="button"
                className="workout-card__ghost-button"
                onClick={() => {
                  if (typeof workoutExerciseId === "number" && typeof setEntry.id === "number") {
                    onDeleteSet(workoutExerciseId, setEntry.id);
                  }
                }}
                disabled={
                  typeof workoutExerciseId !== "number" || typeof setEntry.id !== "number"
                }
              >
                Удалить подход
              </button>
            </div>
            <div className="workout-card__set-grid">
              <label className="workout-card__field">
                <span>Reps</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={repsValue}
                  onChange={(event) => onChangeSetValue(setKey, "reps", event.target.value)}
                />
              </label>
              <label className="workout-card__field">
                <span>Вес</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step={0.5}
                  value={weightValue}
                  onChange={(event) => onChangeSetValue(setKey, "weight", event.target.value)}
                />
              </label>
              <label className="workout-card__field">
                <span>Секунды</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={durationValue}
                  onChange={(event) =>
                    onChangeSetValue(setKey, "durationSeconds", event.target.value)
                  }
                />
              </label>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className="workout-card__primary-button"
        onClick={() => {
          if (typeof workoutExerciseId === "number") {
            onAddSet(workoutExerciseId, nextSetOrderIndex);
          }
        }}
        disabled={typeof workoutExerciseId !== "number"}
      >
        Добавить подход
      </button>
    </article>
  );
};

export const WorkoutPage = (): ReactElement => {
  const params = useParams<{ workoutId: string }>();
  const location = useLocation();
  const locationState = location.state as WorkoutLocationState | null;
  const workoutIdRaw = params.workoutId ?? "";
  const workoutIdNumber = Number(workoutIdRaw);
  const workoutId = Number.isFinite(workoutIdNumber) ? workoutIdNumber : null;
  const initialWorkout = locationState?.workout ?? null;

  const queryClient = useQueryClient();
  const [setDrafts, setSetDrafts] = useState<SetDraftMap>({});
  const [newExerciseId, setNewExerciseId] = useState<string>("");
  const [newExerciseError, setNewExerciseError] = useState<string | null>(null);

  const {
    data: workoutData,
    isLoading: isWorkoutLoading,
    isError: isWorkoutError,
    error: workoutError,
    refetch: refetchWorkout,
  } = useWorkout(workoutId);
  const addExerciseMutation = useAddExerciseMutation();
  const deleteExerciseMutation = useDeleteExerciseMutation();
  const addSetEntryMutation = useAddSetEntryMutation();
  const deleteSetEntryMutation = useDeleteSetEntryMutation();

  useEffect(() => {
    if (typeof workoutId !== "number" || !initialWorkout) {
      return;
    }

    queryClient.setQueryData(workoutQueryKey(workoutId), initialWorkout);
  }, [initialWorkout, queryClient, workoutId]);

  const workout = workoutData ?? initialWorkout ?? null;

  const exercises = useMemo(() => {
    const items = workout?.exercises ? [...workout.exercises] : [];
    items.sort((left, right) => {
      const leftIndex = left.orderIndex ?? 0;
      const rightIndex = right.orderIndex ?? 0;
      return leftIndex - rightIndex;
    });
    return items;
  }, [workout?.exercises]);

  const updateWorkoutData = useCallback(
    (updater: (previous: WorkoutSessionResponse | null) => WorkoutSessionResponse | null): void => {
      if (typeof workoutId !== "number") {
        return;
      }

      queryClient.setQueryData(workoutQueryKey(workoutId), updater);
    },
    [queryClient, workoutId],
  );

  const handleSetFieldChange = useCallback(
    (setKey: string, field: keyof SetDraft, value: string): void => {
      const parsed = value.trim() === "" ? null : Number(value);
      const nextValue = Number.isNaN(parsed) ? null : parsed;

      setSetDrafts((current) => {
        const existing = current[setKey] ?? {
          reps: null,
          weight: null,
          durationSeconds: null,
        };

        return {
          ...current,
          [setKey]: {
            ...existing,
            [field]: nextValue,
          },
        };
      });
    },
    [],
  );

  const handleAddExercise = (): void => {
    setNewExerciseError(null);

    if (typeof workoutId !== "number") {
      setNewExerciseError("Некорректный идентификатор тренировки.");
      return;
    }

    const parsedExerciseId = Number(newExerciseId);
    if (!Number.isFinite(parsedExerciseId)) {
      setNewExerciseError("Введите корректный exerciseId.");
      return;
    }

    const nextOrderIndex = getNextOrderIndex(workout?.exercises);

    addExerciseMutation.mutate(
      {
        workoutId,
        payload: {
          exerciseId: parsedExerciseId,
          orderIndex: nextOrderIndex,
        },
      },
      {
        onSuccess: (response) => {
          updateWorkoutData((previous) => {
            const baseWorkout: WorkoutSessionResponse =
              previous ??
              workout ?? {
                id: workoutId,
                title: initialWorkout?.title,
                startedAt: initialWorkout?.startedAt,
                templateId: initialWorkout?.templateId,
                exercises: [],
              };

            return {
              ...baseWorkout,
              exercises: [...(baseWorkout.exercises ?? []), response],
            };
          });
          setNewExerciseId("");
        },
      },
    );
  };

  const handleDeleteExercise = (workoutExerciseId: number): void => {
    if (typeof workoutId !== "number") {
      return;
    }

    deleteExerciseMutation.mutate(
      { workoutId, workoutExerciseId },
      {
        onSuccess: () => {
          updateWorkoutData((previous) => {
            if (!previous) {
              return previous;
            }

            return {
              ...previous,
              exercises: (previous.exercises ?? []).filter(
                (exercise) => exercise.id !== workoutExerciseId,
              ),
            };
          });
        },
      },
    );
  };

  const handleAddSet = (workoutExerciseId: number, nextOrderIndex: number): void => {
    if (typeof workoutId !== "number") {
      return;
    }

    addSetEntryMutation.mutate(
      {
        workoutId,
        workoutExerciseId,
        payload: {
          orderIndex: nextOrderIndex,
          reps: 0,
          weight: null,
          durationSeconds: null,
        },
      },
      {
        onSuccess: (response) => {
          updateWorkoutData((previous) => {
            if (!previous) {
              return previous;
            }

            return {
              ...previous,
              exercises: (previous.exercises ?? []).map((exercise) => {
                if (exercise.id !== workoutExerciseId) {
                  return exercise;
                }

                return {
                  ...exercise,
                  sets: [...(exercise.sets ?? []), response],
                };
              }),
            };
          });
        },
      },
    );
  };

  const handleDeleteSet = (workoutExerciseId: number, setEntryId: number): void => {
    if (typeof workoutId !== "number") {
      return;
    }

    deleteSetEntryMutation.mutate(
      { workoutId, workoutExerciseId, setEntryId },
      {
        onSuccess: () => {
          updateWorkoutData((previous) => {
            if (!previous) {
              return previous;
            }

            return {
              ...previous,
              exercises: (previous.exercises ?? []).map((exercise) => {
                if (exercise.id !== workoutExerciseId) {
                  return exercise;
                }

                return {
                  ...exercise,
                  sets: (exercise.sets ?? []).filter((setEntry) => setEntry.id !== setEntryId),
                };
              }),
            };
          });
          setSetDrafts((current) => {
            const nextDrafts = { ...current };
            delete nextDrafts[`set-${setEntryId}`];
            return nextDrafts;
          });
        },
      },
    );
  };

  if (typeof workoutId !== "number") {
    return (
      <section className="workout-page">
        <header className="workout-page__header">
          <div>
            <h1>Тренировка</h1>
            <p className="workout-page__meta">Некорректный идентификатор тренировки.</p>
          </div>
          <div>
            <Link to="/start" className="workout-page__link">
              К запуску
            </Link>
            <Link to="/workouts" className="workout-page__link">
              К истории
            </Link>
          </div>
        </header>
      </section>
    );
  }

  if (isWorkoutLoading && !workout) {
    return (
      <section className="workout-page">
        <header className="workout-page__header">
          <div>
            <h1>Тренировка</h1>
            <p className="workout-page__meta">Загрузка...</p>
          </div>
          <div>
            <Link to="/start" className="workout-page__link">
              К запуску
            </Link>
            <Link to="/workouts" className="workout-page__link">
              К истории
            </Link>
          </div>
        </header>
      </section>
    );
  }

  if (isWorkoutError && !workout) {
    return (
      <section className="workout-page">
        <header className="workout-page__header">
          <div>
            <h1>Тренировка</h1>
            <p className="workout-page__meta">
              Ошибка: {workoutError?.message ?? "Не удалось загрузить тренировку"}
            </p>
          </div>
          <div>
            <Link to="/start" className="workout-page__link">
              К запуску
            </Link>
            <Link to="/workouts" className="workout-page__link">
              К истории
            </Link>
          </div>
        </header>
        <button type="button" onClick={() => refetchWorkout()}>
          Повторить
        </button>
      </section>
    );
  }

  if (!workout) {
    return (
      <section className="workout-page">
        <header className="workout-page__header">
          <div>
            <h1>Тренировка</h1>
            <p className="workout-page__meta">Тренировка не найдена.</p>
          </div>
          <div>
            <Link to="/start" className="workout-page__link">
              К запуску
            </Link>
            <Link to="/workouts" className="workout-page__link">
              К истории
            </Link>
          </div>
        </header>
      </section>
    );
  }

  const headerTitle = workout.title ?? `Тренировка #${workoutId}`;
  const startedAt = formatDateTime(workout.startedAt);

  return (
    <section className="workout-page">
      <header className="workout-page__header">
        <div>
          <h1>{headerTitle}</h1>
          {startedAt ? <p className="workout-page__meta">Старт: {startedAt}</p> : null}
        </div>
        <div>
          <Link to="/start" className="workout-page__link">
            К запуску
          </Link>
          <Link to="/workouts" className="workout-page__link">
            К истории
          </Link>
        </div>
      </header>

      {isWorkoutError ? (
        <div className="workout-page__error">
          Ошибка загрузки: {workoutError?.message ?? "Не удалось загрузить тренировку"}
          <button type="button" onClick={() => refetchWorkout()}>
            Повторить
          </button>
        </div>
      ) : null}

      {exercises.length === 0 ? <p>Упражнений пока нет.</p> : null}

      <div className="workout-page__list">
        {exercises.map((exercise) => {
          const exerciseKey = exercise.id ?? `exercise-${exercise.exerciseId ?? "unknown"}`;

          return (
            <ExerciseCard
              key={exerciseKey}
              workoutExercise={exercise}
              setDrafts={setDrafts}
              onChangeSetValue={handleSetFieldChange}
              onAddSet={handleAddSet}
              onDeleteSet={handleDeleteSet}
              onDeleteExercise={handleDeleteExercise}
            />
          );
        })}
      </div>

      <section className="workout-page__add">
        <h2>Добавить упражнение</h2>
        <div className="workout-page__add-row">
          <label className="workout-page__field">
            <span>exerciseId</span>
            <input
              type="number"
              inputMode="numeric"
              value={newExerciseId}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setNewExerciseId(event.target.value)
              }
            />
          </label>
          <button
            type="button"
            className="workout-page__primary-button"
            onClick={handleAddExercise}
            disabled={addExerciseMutation.isPending}
          >
            Добавить
          </button>
        </div>
        {newExerciseError ? <p className="workout-page__error">{newExerciseError}</p> : null}
        {addExerciseMutation.isError ? (
          <p className="workout-page__error">
            Ошибка добавления упражнения: {addExerciseMutation.error?.message}
          </p>
        ) : null}
        {deleteExerciseMutation.isError ? (
          <p className="workout-page__error">
            Ошибка удаления упражнения: {deleteExerciseMutation.error?.message}
          </p>
        ) : null}
        {addSetEntryMutation.isError ? (
          <p className="workout-page__error">
            Ошибка добавления подхода: {addSetEntryMutation.error?.message}
          </p>
        ) : null}
        {deleteSetEntryMutation.isError ? (
          <p className="workout-page__error">
            Ошибка удаления подхода: {deleteSetEntryMutation.error?.message}
          </p>
        ) : null}
      </section>
    </section>
  );
};
