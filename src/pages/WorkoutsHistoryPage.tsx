import { type ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  type WorkoutSummaryResponse,
} from "../features/workouts/history/api";
import { useWorkouts } from "../features/workouts/history/queries";

const formatShortDate = (value?: string): string => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().slice(0, 10);
};

const getWorkoutTitle = (
  workout: WorkoutSummaryResponse,
  index: number,
): string => {
  if (workout.title) {
    return workout.title;
  }

  if (typeof workout.id === "number") {
    return `Тренировка #${workout.id}`;
  }

  return `Тренировка #${index + 1}`;
};

export const WorkoutsHistoryPage = (): ReactElement => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useWorkouts();
  const workouts = data ?? [];

  return (
    <section>
      <header>
        <h1>История тренировок</h1>
        <Link to="/start">Начать тренировку</Link>
      </header>

      {isLoading ? <p>Загрузка...</p> : null}

      {isError ? (
        <div>
          <p>Ошибка: {error?.message ?? "Не удалось загрузить тренировки"}</p>
          <button type="button" onClick={() => refetch()}>
            Повторить
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && workouts.length === 0 ? (
        <div>
          <p>Тренировок пока нет</p>
          <Link to="/start">Начать тренировку</Link>
        </div>
      ) : null}

      {workouts.length > 0 ? (
        <ul>
          {workouts.map((workout, index) => {
            const workoutId = workout.id;
            const startedAt = formatShortDate(workout.startedAt);
            const templateId = workout.templateId;
            const title = getWorkoutTitle(workout, index);

            return (
              <li key={workoutId ?? `workout-${index}`}>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof workoutId === "number") {
                      navigate(`/workouts/${workoutId}`);
                    }
                  }}
                  disabled={typeof workoutId !== "number"}
                >
                  <div>
                    <strong>{title}</strong>
                    {startedAt ? <p>Старт: {startedAt}</p> : null}
                    {typeof templateId === "number" ? (
                      <p>Шаблон: {templateId}</p>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
};
