/**
 * Этот файл сгенерирован из OpenAPI схемы.
 * Источник: docs/openapi.yaml
 */
export interface paths {
  "/api/templates/{id}": {
    get: {
      parameters: {
        path: {
          id: number;
        };
      };
      responses: {
        200: {
          content: {
            "*/*": components["schemas"]["TemplateResponse"];
          };
        };
        404: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
      };
    };
    put: {
      parameters: {
        path: {
          id: number;
        };
      };
      requestBody: {
        content: {
          "application/json": components["schemas"]["TemplateCreateRequest"];
        };
      };
      responses: {
        200: {
          content: {
            "*/*": components["schemas"]["TemplateResponse"];
          };
        };
        400: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
        404: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
      };
    };
    delete: {
      parameters: {
        path: {
          id: number;
        };
      };
      responses: {
        204: never;
        404: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
      };
    };
  };
  "/api/workouts/{workoutId}/exercises": {
    post: {
      parameters: {
        path: {
          workoutId: number;
        };
      };
      requestBody: {
        content: {
          "application/json": components["schemas"]["AddWorkoutExerciseRequest"];
        };
      };
      responses: {
        200: {
          content: {
            "*/*": components["schemas"]["WorkoutExerciseResponse"];
          };
        };
        400: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
        404: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
      };
    };
  };
  "/api/workouts/{workoutId}/exercises/{workoutExerciseId}/sets": {
    post: {
      parameters: {
        path: {
          workoutId: number;
          workoutExerciseId: number;
        };
      };
      requestBody: {
        content: {
          "application/json": components["schemas"]["AddSetEntryRequest"];
        };
      };
      responses: {
        200: {
          content: {
            "*/*": components["schemas"]["SetEntryResponse"];
          };
        };
        400: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
        404: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
      };
    };
  };
  "/api/workouts/start": {
    post: {
      requestBody: {
        content: {
          "application/json": components["schemas"]["StartWorkoutRequest"];
        };
      };
      responses: {
        200: {
          content: {
            "*/*": components["schemas"]["WorkoutSessionResponse"];
          };
        };
        400: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
        404: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
      };
    };
  };
  "/api/templates": {
    get: {
      responses: {
        200: {
          content: {
            "*/*": components["schemas"]["TemplateResponse"];
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          "application/json": components["schemas"]["TemplateCreateRequest"];
        };
      };
      responses: {
        201: {
          content: {
            "*/*": components["schemas"]["TemplateResponse"];
          };
        };
        400: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
      };
    };
  };
  "/api/exercises/{exerciseId}/last-max": {
    get: {
      parameters: {
        path: {
          exerciseId: number;
        };
      };
      responses: {
        200: {
          content: {
            "*/*": components["schemas"]["ExerciseLastMaxResponse"];
          };
        };
        404: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
      };
    };
  };
  "/api/workouts/{workoutId}/exercises/{workoutExerciseId}": {
    delete: {
      parameters: {
        path: {
          workoutId: number;
          workoutExerciseId: number;
        };
      };
      responses: {
        204: never;
        404: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
      };
    };
  };
  "/api/workouts/{workoutId}/exercises/{workoutExerciseId}/sets/{setEntryId}": {
    delete: {
      parameters: {
        path: {
          workoutId: number;
          workoutExerciseId: number;
          setEntryId: number;
        };
      };
      responses: {
        204: never;
        404: {
          content: {
            "*/*": components["schemas"]["ApiError"];
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    TemplateCreateRequest: {
      name: string;
      exercises: components["schemas"]["TemplateExerciseRequest"][];
    };
    TemplateExerciseRequest: {
      exerciseId: number;
      orderIndex?: number;
      sets: components["schemas"]["TemplateSetRequest"][];
    };
    TemplateSetRequest: {
      orderIndex?: number;
      plannedReps?: number | null;
      plannedDurationSeconds?: number | null;
      oneOfPlannedFieldsPresent?: boolean;
    };
    ApiError: {
      timestamp?: string;
      path?: string;
      code?: string;
      message?: string;
      details?: Record<string, unknown> | null;
    };
    TemplateExerciseResponse: {
      exerciseId?: number;
      orderIndex?: number;
      sets?: components["schemas"]["TemplateSetResponse"][];
    };
    TemplateResponse: {
      id?: number;
      name?: string;
      exercises?: components["schemas"]["TemplateExerciseResponse"][];
    };
    TemplateSetResponse: {
      orderIndex?: number;
      plannedReps?: number | null;
      plannedDurationSeconds?: number | null;
    };
    AddWorkoutExerciseRequest: {
      exerciseId: number;
      orderIndex: number;
    };
    SetEntryResponse: {
      id?: number;
      orderIndex?: number;
      reps?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
    };
    WorkoutExerciseResponse: {
      id?: number;
      exerciseId?: number;
      orderIndex?: number;
      sets?: components["schemas"]["SetEntryResponse"][];
    };
    AddSetEntryRequest: {
      orderIndex: number;
      reps?: number | null;
      weight?: number | null;
      durationSeconds?: number | null;
    };
    StartWorkoutRequest: {
      templateId?: number | null;
      title?: string | null;
    };
    WorkoutSessionResponse: {
      id?: number;
      title?: string;
      startedAt?: string;
      templateId?: number | null;
      exercises?: components["schemas"]["WorkoutExerciseResponse"][];
    };
    ExerciseLastMaxResponse: {
      exerciseId?: number;
      lastWorkoutId?: number | null;
      lastWorkoutStartedAt?: string | null;
      maxWeight?: number | null;
      maxDurationSeconds?: number | null;
    };
  };
}

export type operations = Record<string, never>;
