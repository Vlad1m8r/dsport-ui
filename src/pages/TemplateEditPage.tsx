import type { ChangeEvent, ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useExercisesCatalog } from "../features/exercises/catalog/queries";
import {
  useTemplateQuery,
  useUpdateTemplateMutation
} from "../features/templates/queries";
import type { TemplateByIdResponse } from "../features/templates/api";

const parseTemplateId = (templateIdParam: string | undefined): number | null => {
  if (typeof templateIdParam !== "string") {
    return null;
  }

  const parsedTemplateId: number = Number(templateIdParam);

  return Number.isInteger(parsedTemplateId) ? parsedTemplateId : null;
};

type ExerciseType = "REPS_WEIGHT" | "TIME";

interface DraftSet {
  localId: string;
  orderIndex: number;
  plannedReps: number | null;
  plannedDurationSeconds: number | null;
}

interface DraftExercise {
  exerciseId: number;
  orderIndex: number;
  sets: DraftSet[];
}

interface DraftTemplate {
  name: string;
  exercises: DraftExercise[];
}

interface ValidationErrorState {
  name: string | null;
  sets: Record<string, string>;
}

interface ExerciseOption {
  id: number;
  name: string;
  type: ExerciseType;
}

const createSetLocalId = (): string => {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeTemplateToDraft = (template: TemplateByIdResponse): DraftTemplate => {
  const draftExercises: DraftExercise[] = (template.exercises ?? []).map((exercise) => ({
    exerciseId: exercise.exerciseId ?? -1,
    orderIndex: exercise.orderIndex ?? 0,
    sets: (exercise.sets ?? []).map((setEntry) => ({
      localId: createSetLocalId(),
      orderIndex: setEntry.orderIndex ?? 0,
      plannedReps: setEntry.plannedReps ?? null,
      plannedDurationSeconds: setEntry.plannedDurationSeconds ?? null,
    })),
  }));

  return {
    name: template.name ?? "",
    exercises: draftExercises.filter((exercise) => exercise.exerciseId > 0),
  };
};

const getMaxOrderIndex = (orderIndexes: number[]): number => {
  if (orderIndexes.length === 0) {
    return 0;
  }

  return Math.max(...orderIndexes);
};

const parsePositiveNumber = (value: string): number | null => {
  const parsed: number = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const getSetErrorKey = (exerciseId: number, setLocalId: string): string => {
  return `${exerciseId}:${setLocalId}`;
};

export const TemplateEditPage = (): ReactElement => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const templateId: number | null = parseTemplateId(params.id);
  const templateQuery = useTemplateQuery(templateId);
  const catalogQuery = useExercisesCatalog();
  const updateTemplateMutation = useUpdateTemplateMutation();

  const [draft, setDraft] = useState<DraftTemplate | null>(null);
  const [hasDraftChanges, setHasDraftChanges] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorState>({
    name: null,
    sets: {},
  });

  useEffect((): void => {
    if (!templateQuery.data || hasDraftChanges) {
      return;
    }

    setDraft(normalizeTemplateToDraft(templateQuery.data));
  }, [hasDraftChanges, templateQuery.data]);

  const exerciseById = useMemo<Map<number, ExerciseOption>>(() => {
    const map = new Map<number, ExerciseOption>();

    (catalogQuery.data ?? []).forEach((exercise) => {
      if (
        typeof exercise.id === "number" &&
        exercise.type &&
        (exercise.type === "REPS_WEIGHT" || exercise.type === "TIME")
      ) {
        map.set(exercise.id, {
          id: exercise.id,
          name: exercise.name ?? `Упражнение #${exercise.id}`,
          type: exercise.type,
        });
      }
    });

    return map;
  }, [catalogQuery.data]);

  useEffect((): void => {
    const mode = searchParams.get("mode");
    const pickedExerciseId = searchParams.get("pickedExerciseId");

    if (mode !== "template" || !pickedExerciseId || draft === null) {
      return;
    }

    const pickedId = Number(pickedExerciseId);

    if (!Number.isInteger(pickedId) || pickedId <= 0) {
      return;
    }

    setDraft((previousDraft) => {
      if (previousDraft === null) {
        return previousDraft;
      }

      const alreadyExists = previousDraft.exercises.some((item) => item.exerciseId === pickedId);

      if (alreadyExists) {
        return previousDraft;
      }

      const nextOrderIndex = getMaxOrderIndex(
        previousDraft.exercises.map((exercise) => exercise.orderIndex),
      );

      setHasDraftChanges(true);

      return {
        ...previousDraft,
        exercises: [
          ...previousDraft.exercises,
          {
            exerciseId: pickedId,
            orderIndex: nextOrderIndex + 1,
            sets: [],
          },
        ],
      };
    });

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("pickedExerciseId");
    nextParams.delete("mode");
    setSearchParams(nextParams, { replace: true });
  }, [draft, searchParams, setSearchParams]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;

    setDraft((previousDraft) => {
      if (previousDraft === null) {
        return previousDraft;
      }

      return {
        ...previousDraft,
        name: value,
      };
    });
    setHasDraftChanges(true);

    if (validationErrors.name) {
      setValidationErrors((previousErrors) => ({
        ...previousErrors,
        name: null,
      }));
    }
  };

  const handleGoToExercisePicker = (): void => {
    if (templateId === null) {
      return;
    }

    navigate(`/pickers/exercises?returnTo=/templates/${templateId}/edit&mode=template`);
  };

  const handleRemoveExercise = (exerciseId: number): void => {
    setDraft((previousDraft) => {
      if (previousDraft === null) {
        return previousDraft;
      }

      return {
        ...previousDraft,
        exercises: previousDraft.exercises.filter((exercise) => exercise.exerciseId !== exerciseId),
      };
    });
    setHasDraftChanges(true);
  };

  const handleAddSet = (exerciseId: number): void => {
    setDraft((previousDraft) => {
      if (previousDraft === null) {
        return previousDraft;
      }

      return {
        ...previousDraft,
        exercises: previousDraft.exercises.map((exercise) => {
          if (exercise.exerciseId !== exerciseId) {
            return exercise;
          }

          const exerciseType = exerciseById.get(exerciseId)?.type;
          const nextOrderIndex = getMaxOrderIndex(exercise.sets.map((setEntry) => setEntry.orderIndex)) + 1;

          const nextSet: DraftSet = {
            localId: createSetLocalId(),
            orderIndex: nextOrderIndex,
            plannedReps: exerciseType === "REPS_WEIGHT" ? 0 : null,
            plannedDurationSeconds: exerciseType === "TIME" ? 0 : null,
          };

          return {
            ...exercise,
            sets: [...exercise.sets, nextSet],
          };
        }),
      };
    });
    setHasDraftChanges(true);
  };

  const handleRemoveSet = (exerciseId: number, setLocalId: string): void => {
    setDraft((previousDraft) => {
      if (previousDraft === null) {
        return previousDraft;
      }

      return {
        ...previousDraft,
        exercises: previousDraft.exercises.map((exercise) => {
          if (exercise.exerciseId !== exerciseId) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.filter((setEntry) => setEntry.localId !== setLocalId),
          };
        }),
      };
    });
    setHasDraftChanges(true);

    const setErrorKey = getSetErrorKey(exerciseId, setLocalId);

    setValidationErrors((previousErrors) => {
      if (!previousErrors.sets[setErrorKey]) {
        return previousErrors;
      }

      const nextSetErrors = { ...previousErrors.sets };
      delete nextSetErrors[setErrorKey];

      return {
        ...previousErrors,
        sets: nextSetErrors,
      };
    });
  };

  const handleSetValueChange = (
    exerciseId: number,
    setLocalId: string,
    field: "plannedReps" | "plannedDurationSeconds",
    value: string,
  ): void => {
    const numericValue = value.length === 0 ? null : Number(value);

    setDraft((previousDraft) => {
      if (previousDraft === null) {
        return previousDraft;
      }

      return {
        ...previousDraft,
        exercises: previousDraft.exercises.map((exercise) => {
          if (exercise.exerciseId !== exerciseId) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.map((setEntry) => {
              if (setEntry.localId !== setLocalId) {
                return setEntry;
              }

              return {
                ...setEntry,
                [field]: Number.isFinite(numericValue) ? numericValue : null,
              };
            }),
          };
        }),
      };
    });
    setHasDraftChanges(true);

    const setErrorKey = getSetErrorKey(exerciseId, setLocalId);

    setValidationErrors((previousErrors) => {
      if (!previousErrors.sets[setErrorKey]) {
        return previousErrors;
      }

      const nextSetErrors = { ...previousErrors.sets };
      delete nextSetErrors[setErrorKey];

      return {
        ...previousErrors,
        sets: nextSetErrors,
      };
    });
  };

  const handleSave = (): void => {
    if (templateId === null || draft === null) {
      return;
    }

    const trimmedName = draft.name.trim();
    const nextErrors: ValidationErrorState = {
      name: null,
      sets: {},
    };

    if (trimmedName.length === 0) {
      nextErrors.name = "Название шаблона не может быть пустым.";
    }

    draft.exercises.forEach((exercise) => {
      const exerciseType = exerciseById.get(exercise.exerciseId)?.type;

      exercise.sets.forEach((setEntry) => {
        const setErrorKey = getSetErrorKey(exercise.exerciseId, setEntry.localId);

        if (exerciseType === "REPS_WEIGHT") {
          if (parsePositiveNumber(String(setEntry.plannedReps ?? "")) === null) {
            nextErrors.sets[setErrorKey] = "Для подхода нужно указать количество повторений больше 0.";
          }

          return;
        }

        if (exerciseType === "TIME") {
          if (parsePositiveNumber(String(setEntry.plannedDurationSeconds ?? "")) === null) {
            nextErrors.sets[setErrorKey] = "Для подхода нужно указать длительность в секундах больше 0.";
          }

          return;
        }

        nextErrors.sets[setErrorKey] = "Не удалось определить тип упражнения. Обновите каталог и попробуйте снова.";
      });
    });

    setValidationErrors(nextErrors);

    if (nextErrors.name || Object.keys(nextErrors.sets).length > 0) {
      return;
    }

    updateTemplateMutation.mutate(
      {
        templateId,
        payload: {
          name: trimmedName,
          exercises: draft.exercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            orderIndex: exercise.orderIndex,
            sets: exercise.sets.map((setEntry) => ({
              orderIndex: setEntry.orderIndex,
              plannedReps: setEntry.plannedReps,
              plannedDurationSeconds: setEntry.plannedDurationSeconds,
            })),
          })),
        },
      },
      {
        onSuccess: (): void => {
          setHasDraftChanges(false);
        },
      },
    );
  };

  return (
    <section>
      <header>
        <h1>Редактирование шаблона</h1>
      </header>

      {templateId === null ? <p>Некорректный идентификатор шаблона.</p> : null}
      {templateQuery.isLoading ? <p>Загрузка шаблона...</p> : null}
      {templateQuery.isError ? (
        <p>Ошибка: {templateQuery.error?.message ?? "Не удалось загрузить шаблон"}</p>
      ) : null}
      {catalogQuery.isLoading ? <p>Загрузка каталога упражнений...</p> : null}
      {catalogQuery.isError ? (
        <p>Ошибка каталога: {catalogQuery.error?.message ?? "Не удалось загрузить каталог упражнений"}</p>
      ) : null}

      {draft ? (
        <>
          <section>
            <label htmlFor="template-edit-name">Название шаблона</label>
            <input
              id="template-edit-name"
              type="text"
              value={draft.name}
              onChange={handleNameChange}
              aria-invalid={validationErrors.name ? "true" : "false"}
            />
            {validationErrors.name ? <p>{validationErrors.name}</p> : null}
          </section>

          <section>
            <h2>Упражнения</h2>
            <button type="button" onClick={handleGoToExercisePicker}>
              Добавить упражнение
            </button>

            {draft.exercises.length === 0 ? <p>Пока нет упражнений в шаблоне.</p> : null}

            {draft.exercises.map((exercise) => {
              const exerciseInfo = exerciseById.get(exercise.exerciseId);

              return (
                <article key={exercise.exerciseId}>
                  <header>
                    <h3>{exerciseInfo?.name ?? `Упражнение #${exercise.exerciseId}`}</h3>
                    <p>Тип: {exerciseInfo?.type ?? "UNKNOWN"}</p>
                    <button type="button" onClick={() => handleRemoveExercise(exercise.exerciseId)}>
                      Удалить упражнение
                    </button>
                  </header>

                  <div>
                    <button type="button" onClick={() => handleAddSet(exercise.exerciseId)}>
                      Добавить подход
                    </button>
                  </div>

                  {exercise.sets.length === 0 ? <p>Подходов пока нет.</p> : null}

                  {exercise.sets.map((setEntry) => {
                    const setError = validationErrors.sets[
                      getSetErrorKey(exercise.exerciseId, setEntry.localId)
                    ];

                    return (
                      <div key={setEntry.localId}>
                        <p>Подход #{setEntry.orderIndex}</p>

                        {exerciseInfo?.type === "REPS_WEIGHT" ? (
                          <label>
                            Плановые повторения
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={setEntry.plannedReps ?? ""}
                              onChange={(event) => {
                                handleSetValueChange(
                                  exercise.exerciseId,
                                  setEntry.localId,
                                  "plannedReps",
                                  event.target.value,
                                );
                              }}
                              aria-invalid={setError ? "true" : "false"}
                            />
                          </label>
                        ) : null}

                        {exerciseInfo?.type === "TIME" ? (
                          <label>
                            Плановая длительность (сек)
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={setEntry.plannedDurationSeconds ?? ""}
                              onChange={(event) => {
                                handleSetValueChange(
                                  exercise.exerciseId,
                                  setEntry.localId,
                                  "plannedDurationSeconds",
                                  event.target.value,
                                );
                              }}
                              aria-invalid={setError ? "true" : "false"}
                            />
                          </label>
                        ) : null}

                        {setError ? <p>{setError}</p> : null}

                        <button
                          type="button"
                          onClick={() => handleRemoveSet(exercise.exerciseId, setEntry.localId)}
                        >
                          Удалить подход
                        </button>
                      </div>
                    );
                  })}
                </article>
              );
            })}
          </section>

          <section>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateTemplateMutation.isPending || catalogQuery.isLoading}
            >
              {updateTemplateMutation.isPending ? "Сохранение..." : "Сохранить"}
            </button>
            {updateTemplateMutation.isError ? (
              <p>Ошибка сохранения: {updateTemplateMutation.error?.message ?? "Не удалось сохранить"}</p>
            ) : null}
            {updateTemplateMutation.isSuccess && !hasDraftChanges ? <p>Шаблон сохранён.</p> : null}
          </section>
        </>
      ) : null}

      <button type="button" onClick={() => navigate("/templates")}>
        Назад
      </button>
      <Link to="/templates">К списку шаблонов</Link>
    </section>
  );
};
