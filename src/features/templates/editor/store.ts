import { useSyncExternalStore } from "react";

import type { TemplateByIdResponse } from "../api";

export interface DraftSet {
  localId: string;
  orderIndex: number;
  plannedReps: number | null;
  plannedDurationSeconds: number | null;
}

export interface DraftExercise {
  exerciseId: number;
  orderIndex: number;
  sets: DraftSet[];
}

export interface TemplateDraft {
  name: string;
  exercises: DraftExercise[];
}

interface TemplateEditorState {
  draftById: Record<string, TemplateDraft>;
}

interface UpdateSetFieldInput {
  templateId: string;
  exerciseOrderIndex: number;
  setLocalId: string;
  field: "plannedReps" | "plannedDurationSeconds";
  value: number | null;
}

interface RemoveSetInput {
  templateId: string;
  exerciseOrderIndex: number;
  setLocalId: string;
}

interface TemplateEditorStore {
  getState: () => TemplateEditorState;
  subscribe: (listener: () => void) => () => void;
  initDraft: (templateId: string, fromServerTemplate: TemplateByIdResponse) => void;
  updateDraft: (templateId: string, partial: Partial<TemplateDraft>) => void;
  addExercise: (templateId: string, exerciseId: number) => void;
  removeExercise: (templateId: string, exerciseOrderIndex: number) => void;
  addSet: (templateId: string, exerciseOrderIndex: number, exerciseType: "REPS_WEIGHT" | "TIME") => void;
  updateSetField: (input: UpdateSetFieldInput) => void;
  removeSet: (input: RemoveSetInput) => void;
  clearDraft: (templateId: string) => void;
}

const STORAGE_KEY = "templateEditorDrafts";

const createSetLocalId = (): string => {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getMaxOrderIndex = (orderIndexes: number[]): number => {
  if (orderIndexes.length === 0) {
    return 0;
  }

  return Math.max(...orderIndexes);
};

const normalizeTemplateToDraft = (template: TemplateByIdResponse): TemplateDraft => {
  return {
    name: template.name ?? "",
    exercises: (template.exercises ?? [])
      .map((exercise): DraftExercise => {
        return {
          exerciseId: exercise.exerciseId ?? -1,
          orderIndex: exercise.orderIndex ?? 0,
          sets: (exercise.sets ?? []).map((setEntry): DraftSet => {
            return {
              localId: createSetLocalId(),
              orderIndex: setEntry.orderIndex ?? 0,
              plannedReps: setEntry.plannedReps ?? null,
              plannedDurationSeconds: setEntry.plannedDurationSeconds ?? null,
            };
          }),
        };
      })
      .filter((exercise) => exercise.exerciseId > 0),
  };
};

const readFromStorage = (): TemplateEditorState => {
  if (typeof window === "undefined") {
    return { draftById: {} };
  }

  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return { draftById: {} };
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (typeof parsed === "object" && parsed !== null && "draftById" in parsed) {
      const candidate = parsed as { draftById?: unknown };

      if (typeof candidate.draftById === "object" && candidate.draftById !== null) {
        return {
          draftById: candidate.draftById as Record<string, TemplateDraft>,
        };
      }
    }
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  return { draftById: {} };
};

const persistState = (state: TemplateEditorState): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const createTemplateEditorStore = (): TemplateEditorStore => {
  let state: TemplateEditorState = readFromStorage();
  const listeners = new Set<() => void>();

  const setState = (updater: (prevState: TemplateEditorState) => TemplateEditorState): void => {
    state = updater(state);
    persistState(state);
    listeners.forEach((listener) => listener());
  };

  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return (): void => {
        listeners.delete(listener);
      };
    },
    initDraft: (templateId: string, fromServerTemplate: TemplateByIdResponse) => {
      setState((previousState) => {
        if (previousState.draftById[templateId]) {
          return previousState;
        }

        return {
          ...previousState,
          draftById: {
            ...previousState.draftById,
            [templateId]: normalizeTemplateToDraft(fromServerTemplate),
          },
        };
      });
    },
    updateDraft: (templateId: string, partial: Partial<TemplateDraft>) => {
      setState((previousState) => {
        const draft = previousState.draftById[templateId];

        if (!draft) {
          return previousState;
        }

        return {
          ...previousState,
          draftById: {
            ...previousState.draftById,
            [templateId]: {
              ...draft,
              ...partial,
            },
          },
        };
      });
    },
    addExercise: (templateId: string, exerciseId: number) => {
      setState((previousState) => {
        const draft = previousState.draftById[templateId];

        if (!draft || draft.exercises.some((exercise) => exercise.exerciseId === exerciseId)) {
          return previousState;
        }

        const nextOrderIndex = getMaxOrderIndex(draft.exercises.map((exercise) => exercise.orderIndex)) + 1;

        return {
          ...previousState,
          draftById: {
            ...previousState.draftById,
            [templateId]: {
              ...draft,
              exercises: [
                ...draft.exercises,
                {
                  exerciseId,
                  orderIndex: nextOrderIndex,
                  sets: [],
                },
              ],
            },
          },
        };
      });
    },
    removeExercise: (templateId: string, exerciseOrderIndex: number) => {
      setState((previousState) => {
        const draft = previousState.draftById[templateId];

        if (!draft) {
          return previousState;
        }

        return {
          ...previousState,
          draftById: {
            ...previousState.draftById,
            [templateId]: {
              ...draft,
              exercises: draft.exercises.filter((exercise) => exercise.orderIndex !== exerciseOrderIndex),
            },
          },
        };
      });
    },
    addSet: (templateId: string, exerciseOrderIndex: number, exerciseType: "REPS_WEIGHT" | "TIME") => {
      setState((previousState) => {
        const draft = previousState.draftById[templateId];

        if (!draft) {
          return previousState;
        }

        return {
          ...previousState,
          draftById: {
            ...previousState.draftById,
            [templateId]: {
              ...draft,
              exercises: draft.exercises.map((exercise) => {
                if (exercise.orderIndex !== exerciseOrderIndex) {
                  return exercise;
                }

                const nextOrderIndex = getMaxOrderIndex(exercise.sets.map((setEntry) => setEntry.orderIndex)) + 1;

                return {
                  ...exercise,
                  sets: [
                    ...exercise.sets,
                    {
                      localId: createSetLocalId(),
                      orderIndex: nextOrderIndex,
                      plannedReps: exerciseType === "REPS_WEIGHT" ? 0 : null,
                      plannedDurationSeconds: exerciseType === "TIME" ? 0 : null,
                    },
                  ],
                };
              }),
            },
          },
        };
      });
    },
    updateSetField: ({ templateId, exerciseOrderIndex, setLocalId, field, value }: UpdateSetFieldInput) => {
      setState((previousState) => {
        const draft = previousState.draftById[templateId];

        if (!draft) {
          return previousState;
        }

        return {
          ...previousState,
          draftById: {
            ...previousState.draftById,
            [templateId]: {
              ...draft,
              exercises: draft.exercises.map((exercise) => {
                if (exercise.orderIndex !== exerciseOrderIndex) {
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
                      [field]: value,
                    };
                  }),
                };
              }),
            },
          },
        };
      });
    },
    removeSet: ({ templateId, exerciseOrderIndex, setLocalId }: RemoveSetInput) => {
      setState((previousState) => {
        const draft = previousState.draftById[templateId];

        if (!draft) {
          return previousState;
        }

        return {
          ...previousState,
          draftById: {
            ...previousState.draftById,
            [templateId]: {
              ...draft,
              exercises: draft.exercises.map((exercise) => {
                if (exercise.orderIndex !== exerciseOrderIndex) {
                  return exercise;
                }

                return {
                  ...exercise,
                  sets: exercise.sets.filter((setEntry) => setEntry.localId !== setLocalId),
                };
              }),
            },
          },
        };
      });
    },
    clearDraft: (templateId: string) => {
      setState((previousState) => {
        if (!previousState.draftById[templateId]) {
          return previousState;
        }

        const nextDraftById = { ...previousState.draftById };
        delete nextDraftById[templateId];

        return {
          ...previousState,
          draftById: nextDraftById,
        };
      });
    },
  };
};

const templateEditorStore = createTemplateEditorStore();

export const useTemplateEditorDraft = (templateId: string | null): TemplateDraft | null => {
  return useSyncExternalStore(
    templateEditorStore.subscribe,
    () => {
      if (!templateId) {
        return null;
      }

      return templateEditorStore.getState().draftById[templateId] ?? null;
    },
    () => null,
  );
};

export const templateEditorStoreActions = {
  initDraft: templateEditorStore.initDraft,
  updateDraft: templateEditorStore.updateDraft,
  addExercise: templateEditorStore.addExercise,
  removeExercise: templateEditorStore.removeExercise,
  addSet: templateEditorStore.addSet,
  updateSetField: templateEditorStore.updateSetField,
  removeSet: templateEditorStore.removeSet,
  clearDraft: templateEditorStore.clearDraft,
};
