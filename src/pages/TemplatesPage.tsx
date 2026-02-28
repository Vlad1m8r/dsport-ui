import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useTemplatesQuery,
} from "../features/templates/queries";
import { useActiveWorkout } from "../features/workouts/history/queries";
import { Button } from "../shared/ui/button/Button";
import { Card } from "../shared/ui/card/Card";
import { EmptyState } from "../shared/ui/empty/EmptyState";
import { SkeletonCard, SkeletonLine } from "../shared/ui/skeleton/Skeleton";

import "./TemplatesPage.css";

export const TemplatesPage = (): ReactElement => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useTemplatesQuery();
  const { data: activeWorkoutId, isLoading: isActiveWorkoutLoading } = useActiveWorkout();
  const createTemplateMutation = useCreateTemplateMutation();
  const deleteMutation = useDeleteTemplateMutation();

  const hasActiveWorkout = typeof activeWorkoutId === "number";
  const workoutCtaLink = hasActiveWorkout ? `/workouts/${activeWorkoutId}` : "/start";
  const workoutCtaLabel = hasActiveWorkout ? "Продолжить начатую" : "Начать тренировку";

  const handleEdit = (id: number | undefined): void => {
    if (typeof id !== "number") {
      return;
    }

    navigate(`/templates/${id}/edit`);
  };

  const handleDelete = (id: number | undefined): void => {
    if (typeof id !== "number") {
      return;
    }

    deleteMutation.mutate(id);
  };

  const handleCreateTemplate = (): void => {
    createTemplateMutation.mutate(
      {
        name: "Новый шаблон",
        exercises: [],
      },
      {
        onSuccess: (template): void => {
          if (typeof template.id === "number") {
            navigate(`/templates/${template.id}/edit`);
          }
        },
      },
    );
  };

  return (
    <section className="templates-page">
      <header className="templates-page__header">
        <h1>Шаблоны тренировок</h1>
        <div className="templates-page__actions">
          <Button
            onClick={handleCreateTemplate}
            disabled={createTemplateMutation.isPending || deleteMutation.isPending}
          >
            Создать шаблон
          </Button>
          <Link
            to={workoutCtaLink}
            aria-busy={isActiveWorkoutLoading}
            className="ui-button ui-button--secondary ui-button--md"
          >
            {workoutCtaLabel}
          </Link>
          <Link to="/workouts" className="ui-button ui-button--ghost ui-button--md">
            История
          </Link>
        </div>
      </header>

      {isLoading ? (
        <SkeletonCard>
          <SkeletonLine width="45%" height="18px" />
          <SkeletonLine />
          <SkeletonLine width="60%" />
        </SkeletonCard>
      ) : null}
      {isError ? <p className="templates-page__error">Ошибка: {error?.message ?? "Не удалось загрузить шаблоны"}</p> : null}
      {deleteMutation.isError ? (
        <p className="templates-page__error">Ошибка: {deleteMutation.error?.message ?? "Не удалось удалить шаблон"}</p>
      ) : null}
      {createTemplateMutation.isError ? (
        <p className="templates-page__error">Ошибка: {createTemplateMutation.error?.message ?? "Не удалось создать шаблон"}</p>
      ) : null}

      {data && data.length === 0 ? (
        <Card>
          <EmptyState
            icon="🧩"
            title="Шаблоны пока не созданы"
            description="Создай первый шаблон, чтобы быстро запускать тренировки."
            actionLabel="Создать шаблон"
            onAction={handleCreateTemplate}
          />
        </Card>
      ) : null}

      <ul className="templates-page__list">
        {data?.map((template) => (
          <Card as="li" key={template.id ?? template.name ?? "template-without-id"}>
            <div className="templates-page__item-header">
              <div>
                <h2 className="templates-page__item-title">{template.name ?? "Без названия"}</h2>
                <span className="templates-page__item-meta">
                  Упражнений: {template.exercises?.length ?? 0}
                </span>
              </div>
              <div className="templates-page__item-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleEdit(template.id)}
                  disabled={deleteMutation.isPending}
                >
                  Изменить
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDelete(template.id)}
                  disabled={deleteMutation.isPending}
                >
                  Удалить
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </ul>
    </section>
  );
};
