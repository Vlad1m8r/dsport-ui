import type { ChangeEvent, ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useExercisesCatalog } from "../features/exercises/catalog/queries";
import {
  templateEditorStoreActions,
  useTemplateEditorDraft,
} from "../features/templates/editor/store";
import { useTemplateQuery, useUpdateTemplateMutation } from "../features/templates/queries";

const parseTemplateId = (templateIdParam: string | undefined): number | null => {
  if (typeof templateIdParam !== "string") {
    return null;
  }

  const parsedTemplateId: number = Number(templateIdParam);

  return Number.isInteger(parsedTemplateId) ? parsedTemplateId : null;
};

type ExerciseType = "REPS_WEIGHT" | "TIME";

interface ValidationErrorState {
  name: string | null;
  sets: Record<string, string>;
}

interface ExerciseOption {
  id: number;
  name: string;
  type: ExerciseType;
}

const parsePositiveNumber = (value: string): number | null => {
  const parsed: number = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const getSetErrorKey = (exerciseOrderIndex: number, setLocalId: string): string => {
  return `${exerciseOrderIndex}:${setLocalId}`;
};

const toTemplateIdKey = (templateId: number | null): string | null => {
  if (templateId === null) {
    return null;
  }

  return String(templateId);
};

export const TemplateEditPage = (): ReactElement => {
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const templateId: number | null = parseTemplateId(params.id);
  const templateIdKey = toTemplateIdKey(templateId);
  const templateQuery = useTemplateQuery(templateId);
  const catalogQuery = useExercisesCatalog();
  const updateTemplateMutation = useUpdateTemplateMutation();
  const draft = useTemplateEditorDraft(templateIdKey);

  const [validationErrors, setValidationErrors] = useState<ValidationErrorState>({
    name: null,
    sets: {},
  });
  const [isSaveSuccessful, setIsSaveSuccessful] = useState<boolean>(false);

  useEffect((): void => {
    if (!templateIdKey || !templateQuery.data || draft) {
      return;
    }

    templateEditorStoreActions.initDraft(templateIdKey, templateQuery.data);
  }, [draft, templateIdKey, templateQuery.data]);

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

    if (mode !== "template" || !pickedExerciseId || !templateIdKey || draft === null) {
      return;
    }

    const pickedId = Number(pickedExerciseId);

    if (Number.isInteger(pickedId) && pickedId > 0) {
      templateEditorStoreActions.addExercise(templateIdKey, pickedId);
      setIsSaveSuccessful(false);
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("pickedExerciseId");
    nextParams.delete("mode");
    setSearchParams(nextParams, { replace: true });
  }, [draft, searchParams, setSearchParams, templateIdKey]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (!templateIdKey) {
      return;
    }

    templateEditorStoreActions.updateDraft(templateIdKey, {
      name: event.target.value,
    });
    setIsSaveSuccessful(false);

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

    const returnTo = `${location.pathname}${location.search}`;
    const pickerParams = new URLSearchParams({
      returnTo,
      mode: "template",
    });

    navigate(`/pickers/exercises?${pickerParams.toString()}`);
  };

  const handleRemoveExercise = (exerciseOrderIndex: number): void => {
    if (!templateIdKey) {
      return;
    }

    templateEditorStoreActions.removeExercise(templateIdKey, exerciseOrderIndex);
    setIsSaveSuccessful(false);
  };

  const handleAddSet = (exerciseOrderIndex: number, exerciseType: ExerciseType): void => {
    if (!templateIdKey) {
      return;
    }

    templateEditorStoreActions.addSet(templateIdKey, exerciseOrderIndex, exerciseType);
    setIsSaveSuccessful(false);
  };

  const handleRemoveSet = (exerciseOrderIndex: number, setLocalId: string): void => {
    if (!templateIdKey) {
      return;
    }

    templateEditorStoreActions.removeSet({
      templateId: templateIdKey,
      exerciseOrderIndex,
      setLocalId,
    });
    setIsSaveSuccessful(false);

    const setErrorKey = getSetErrorKey(exerciseOrderIndex, setLocalId);

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
    exerciseOrderIndex: number,
    setLocalId: string,
    field: "plannedReps" | "plannedDurationSeconds",
    value: string,
  ): void => {
    if (!templateIdKey) {
      return;
    }

    const numericValue = value.length === 0 ? null : Number(value);

    templateEditorStoreActions.updateSetField({
      templateId: templateIdKey,
      exerciseOrderIndex,
      setLocalId,
      field,
      value: Number.isFinite(numericValue) ? numericValue : null,
    });
    setIsSaveSuccessful(false);

    const setErrorKey = getSetErrorKey(exerciseOrderIndex, setLocalId);

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

  const handleResetDraft = (): void => {
    if (!templateIdKey) {
      return;
    }

    templateEditorStoreActions.clearDraft(templateIdKey);

    if (templateQuery.data) {
      templateEditorStoreActions.initDraft(templateIdKey, templateQuery.data);
    }

    setValidationErrors({ name: null, sets: {} });
    setIsSaveSuccessful(false);
  };

  const handleSave = (): void => {
    if (templateId === null || templateIdKey === null || draft === null) {
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
        const setErrorKey = getSetErrorKey(exercise.orderIndex, setEntry.localId);

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
          templateEditorStoreActions.clearDraft(templateIdKey);
          setValidationErrors({ name: null, sets: {} });
          setIsSaveSuccessful(true);
          navigate("/templates");
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
                <article key={`${exercise.exerciseId}-${exercise.orderIndex}`}>
                  <header>
                    <h3>{exerciseInfo?.name ?? `Упражнение #${exercise.exerciseId}`}</h3>
                    <p>Тип: {exerciseInfo?.type ?? "UNKNOWN"}</p>
                    <button type="button" onClick={() => handleRemoveExercise(exercise.orderIndex)}>
                      Удалить упражнение
                    </button>
                  </header>

                  <div>
                    <button
                      type="button"
                      onClick={() => handleAddSet(exercise.orderIndex, exerciseInfo?.type ?? "REPS_WEIGHT")}
                    >
                      Добавить подход
                    </button>
                  </div>

                  {exercise.sets.length === 0 ? <p>Подходов пока нет.</p> : null}

                  {exercise.sets.map((setEntry) => {
                    const setError = validationErrors.sets[getSetErrorKey(exercise.orderIndex, setEntry.localId)];

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
                                  exercise.orderIndex,
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
                                  exercise.orderIndex,
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
                          onClick={() => handleRemoveSet(exercise.orderIndex, setEntry.localId)}
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
            <button type="button" onClick={handleResetDraft} disabled={updateTemplateMutation.isPending}>
              Сбросить
            </button>
            {updateTemplateMutation.isError ? (
              <p>Ошибка сохранения: {updateTemplateMutation.error?.message ?? "Не удалось сохранить"}</p>
            ) : null}
            {isSaveSuccessful ? <p>Шаблон сохранён.</p> : null}
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
