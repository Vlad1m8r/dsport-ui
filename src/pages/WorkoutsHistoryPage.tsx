import { type ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useWorkouts } from "../features/workouts/history/queries";
import type { WorkoutSessionResponse } from "../features/workouts/history/api";

const formatDate = (value?: string): string => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().split("T")[0];
};

const resolveTitle = (workout: WorkoutSessionResponse): string => {
  if (workout.title) {
    return workout.title;
  }

  if (typeof workout.id === "number") {
    return `Тренировка #${workout.id}`;
  }

  return "Тренировка";
};

export const WorkoutsHistoryPage = (): ReactElement => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useWorkouts();

  return (
    <section>
      <header>
        <h1>История тренировок</h1>
        <div>
          <Link to="/start">Начать тренировку</Link>
          <Link to="/templates">К шаблонам</Link>
        </div>
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

      {!isLoading && !isError && data && data.length === 0 ? (
        <div>
          <p>Тренировок пока нет</p>
          <Link to="/start">Начать тренировку</Link>
        </div>
      ) : null}

      {!isLoading && !isError && data && data.length > 0 ? (
        <ul>
          {data.map((workout, index) => {
            const key = workout.id ?? `workout-${index}`;
            const startedAt = formatDate(workout.startedAt);
            const templateId =
              typeof workout.templateId === "number" ? `Шаблон: ${workout.templateId}` : null;

            return (
              <li key={key}>
                <button
                  type="button"
                  disabled={typeof workout.id !== "number"}
                  onClick={() => {
                    if (typeof workout.id === "number") {
                      navigate(`/workouts/${workout.id}`);
                    }
                  }}
                >
                  <div>
                    <strong>{resolveTitle(workout)}</strong>
                    {startedAt ? <span>Дата: {startedAt}</span> : null}
                    {templateId ? <span>{templateId}</span> : null}
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
