import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import { useTemplatesQuery } from "../../features/templates/queries";
import type { TemplateResponse } from "../../features/templates/api";
import type { WorkoutSummaryResponse } from "../../features/workouts/history/api";
import { useWorkouts } from "../../features/workouts/history/queries";
import { Button } from "../../shared/ui/button/Button";
import { SkeletonCard, SkeletonLine } from "../../shared/ui/skeleton/Skeleton";
import "./history.css";

const historyDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

const formatWorkoutDate = (value?: string): string => {
  if (!value) {
    return "Дата неизвестна";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Дата неизвестна";
  }

  return historyDateFormatter.format(parsed);
};

const formatWorkoutDuration = (
  startedAt?: string,
  finishedAt?: string | null,
): string => {
  if (!startedAt || !finishedAt) {
    return "Время неизвестно";
  }

  const start = new Date(startedAt);
  const end = new Date(finishedAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Время неизвестно";
  }

  const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

  if (durationMinutes < 60) {
    return `${durationMinutes} мин`;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (minutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${minutes} мин`;
};

const getTemplateMap = (templates: TemplateResponse[] | undefined): Map<number, TemplateResponse> => {
  const templateMap = new Map<number, TemplateResponse>();

  templates?.forEach((template: TemplateResponse): void => {
    if (typeof template.id === "number") {
      templateMap.set(template.id, template);
    }
  });

  return templateMap;
};

const getWorkoutTitle = (
  workout: WorkoutSummaryResponse,
  template?: TemplateResponse,
): string => {
  if (template?.name) {
    return template.name;
  }

  if (workout.title) {
    return workout.title;
  }

  if (typeof workout.templateId === "number") {
    return `Шаблон #${workout.templateId}`;
  }

  if (typeof workout.id === "number") {
    return `Тренировка #${workout.id}`;
  }

  return "Тренировка без названия";
};

const getExercisesMeta = (template?: TemplateResponse): string => {
  const exercisesCount = template?.exercises?.length;

  if (typeof exercisesCount === "number") {
    return `${exercisesCount} упражнений`;
  }

  return "Состав уточняется";
};

const getWorkoutKey = (workout: WorkoutSummaryResponse, index: number): string => {
  if (typeof workout.id === "number") {
    return String(workout.id);
  }

  return `${workout.startedAt ?? "unknown-start"}-${workout.title ?? "unknown-title"}-${index}`;
};

export const HistoryPage = (): ReactElement => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useWorkouts({
    status: "FINISHED",
  });
  const { data: templates } = useTemplatesQuery();
  const workouts = data ?? [];
  const templateMap = getTemplateMap(templates);

  return (
    <section className="history-page ui-page-root">
      <header className="history-header ui-container ui-stack ui-stack-sm">
        <div className="history-header__top ui-row-between">
          <div className="history-header__heading ui-stack">
            <h1 className="ui-page-title">История тренировок</h1>
            <p className="history-header__description ui-text-muted">
              Завершенные сессии. Здесь появятся поиск, фильтры и аналитика.
            </p>
          </div>
        </div>
      </header>

      <div className="history-scroll ui-page-scroll-area">
        {isLoading ? (
          <div className="history-list ui-container ui-stack" aria-label="Загрузка истории тренировок">
            {Array.from({ length: 4 }).map((_, index: number) => (
              <SkeletonCard key={`history-skeleton-${index}`}>
                <SkeletonLine width="32%" height="14px" />
                <SkeletonLine width="68%" height="20px" />
                <SkeletonLine width="24%" height="13px" />
              </SkeletonCard>
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="history-list ui-container ui-stack">
            <div className="history-state-card ui-glass ui-stack ui-stack-sm" role="alert">
              <div className="history-state-card__title">Не удалось загрузить историю</div>
              <div className="ui-text-muted">
                {error?.message ?? "Попробуйте обновить список еще раз."}
              </div>
              <Button type="button" variant="secondary" onClick={() => void refetch()}>
                Повторить
              </Button>
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && workouts.length === 0 ? (
          <div className="history-empty ui-container ui-stack ui-row-center">
            <div className="history-empty__title">Нет тренировок</div>
            <div className="ui-text-muted">Начните свою первую тренировку</div>
          </div>
        ) : null}

        {!isLoading && !isError && workouts.length > 0 ? (
          <div className="history-list ui-container ui-stack">
            {workouts.map((workout: WorkoutSummaryResponse, index: number) => {
              const template =
                typeof workout.templateId === "number"
                  ? templateMap.get(workout.templateId)
                  : undefined;
              const workoutId = workout.id;
              const isNavigable = typeof workoutId === "number";

              return (
                <button
                  key={getWorkoutKey(workout, index)}
                  type="button"
                  className="workout-card ui-glass ui-pressable"
                  onClick={() => {
                    if (isNavigable) {
                      navigate(`/workouts/${workoutId}`);
                    }
                  }}
                  disabled={!isNavigable}
                >
                  <div className="workout-card__content ui-stack ui-stack-sm">
                    <div className="ui-row-between">
                      <div className="workout-card__date">{formatWorkoutDate(workout.startedAt)}</div>
                      <div className="workout-card__duration ui-text-muted">
                        {formatWorkoutDuration(workout.startedAt, workout.finishedAt)}
                      </div>
                    </div>

                    <div className="workout-card__title">{getWorkoutTitle(workout, template)}</div>

                    <div className="workout-card__meta ui-text-caption">
                      {getExercisesMeta(template)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
};
