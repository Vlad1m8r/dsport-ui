import { useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useTemplatesQuery,
} from "../features/templates/queries";
import { Button } from "../shared/ui/button/Button";
import { Card } from "../shared/ui/card/Card";
import { EmptyState } from "../shared/ui/empty/EmptyState";
import { SkeletonCard, SkeletonLine } from "../shared/ui/skeleton/Skeleton";
import "./TemplatesPage.css";

type DeleteModalState = {
  id: number;
  name: string;
};

export const TemplatesPage = (): ReactElement => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useTemplatesQuery();
  const createTemplateMutation = useCreateTemplateMutation();
  const deleteMutation = useDeleteTemplateMutation();
  const [deleteModalState, setDeleteModalState] = useState<DeleteModalState | null>(null);

  useEffect((): (() => void) | void => {
    if (deleteModalState === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setDeleteModalState(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return (): void => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [deleteModalState]);

  const handleEdit = (id: number | undefined): void => {
    if (typeof id !== "number") {
      return;
    }

    navigate(`/templates/${id}/edit`);
  };

  const handleOpenDeleteConfirm = (id: number | undefined, name: string | undefined): void => {
    if (typeof id !== "number") {
      return;
    }

    setDeleteModalState({
      id,
      name: name ?? "Без названия",
    });
  };

  const handleCloseDeleteConfirm = (): void => {
    setDeleteModalState(null);
  };

  const handleConfirmDelete = (): void => {
    if (!deleteModalState) {
      return;
    }

    deleteMutation.mutate(deleteModalState.id, {
      onSuccess: (): void => {
        setDeleteModalState(null);
      },
    });
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
    <section className="templates-page ui-page-root">
      <header className="templates-page__header">
        <h1 className="templates-page__title">Шаблоны тренировок</h1>
        <Button
          onClick={handleCreateTemplate}
          disabled={createTemplateMutation.isPending || deleteMutation.isPending}
          className="templates-page__create-button"
        >
          Создать шаблон
        </Button>
      </header>

      <div
        className={`templates-page__content ui-page-scroll-area ui-scroll-fade-top ${
          deleteModalState ? "templates-page__content--locked" : ""
        }`}
      >
        {isLoading ? (
          <ul className="templates-page__list" aria-label="Загрузка шаблонов">
            {Array.from({ length: 4 }).map((_, index) => (
              <li key={`template-skeleton-${index}`} className="templates-page__skeleton-item">
                <SkeletonCard>
                  <SkeletonLine width="40%" height="20px" />
                  <SkeletonLine width="28%" height="13px" />
                </SkeletonCard>
              </li>
            ))}
          </ul>
        ) : null}

        {isError ? (
          <div className="templates-page__error-card glass" role="alert">
            <p className="templates-page__error">Ошибка: {error?.message ?? "Не удалось загрузить шаблоны"}</p>
            <Button type="button" variant="secondary" onClick={() => void refetch()}>
              Повторить
            </Button>
          </div>
        ) : null}

        {deleteMutation.isError ? (
          <p className="templates-page__error">Ошибка: {deleteMutation.error?.message ?? "Не удалось удалить шаблон"}</p>
        ) : null}
        {createTemplateMutation.isError ? (
          <p className="templates-page__error">Ошибка: {createTemplateMutation.error?.message ?? "Не удалось создать шаблон"}</p>
        ) : null}

        {!isLoading && data && data.length === 0 ? (
          <Card className="templates-page__empty glass">
            <EmptyState
              icon="🧩"
              title="Нет шаблонов"
              description="Создай первый шаблон тренировки"
              actionLabel="Создать шаблон"
              onAction={handleCreateTemplate}
            />
          </Card>
        ) : null}

        {!isLoading && data && data.length > 0 ? (
          <ul className="templates-page__list">
            {data.map((template) => (
              <Card
                as="li"
                className="templates-page__row glass"
                key={template.id ?? template.name ?? "template-without-id"}
              >
                <div className="templates-page__item-content">
                  <h2 className="templates-page__item-title">{template.name ?? "Без названия"}</h2>
                  <span className="templates-page__item-meta">{template.exercises?.length ?? 0} упражнений</span>
                </div>

                <div className="templates-page__item-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleEdit(template.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Изменить
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="templates-page__delete-button"
                    onClick={() => handleOpenDeleteConfirm(template.id, template.name)}
                    disabled={deleteMutation.isPending}
                  >
                    Удалить
                  </Button>
                </div>
              </Card>
            ))}
          </ul>
        ) : null}
      </div>

      {deleteModalState ? (
        <div className="templates-page__modal" role="dialog" aria-modal="true" aria-labelledby="delete-template-title">
          <button
            type="button"
            className="templates-page__modal-backdrop"
            aria-label="Закрыть модальное окно"
            onClick={handleCloseDeleteConfirm}
          />
          <section className="templates-page__modal-panel">
            <h2 id="delete-template-title" className="templates-page__modal-title">
              Удалить шаблон?
            </h2>
            <p className="templates-page__modal-text">Шаблон будет удалён без возможности восстановления.</p>
            <div className="templates-page__modal-actions">
              <Button type="button" variant="secondary" onClick={handleCloseDeleteConfirm}>
                Отмена
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                Удалить
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
};
