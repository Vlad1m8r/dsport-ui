import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  useDeleteTemplateMutation,
  useTemplatesQuery,
} from "../features/templates/queries";

export const TemplatesPage = (): ReactElement => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useTemplatesQuery();
  const deleteMutation = useDeleteTemplateMutation();

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

  return (
    <section>
      <header>
        <h1>Шаблоны тренировок</h1>
        <div>
          <Link to="/templates/new">
            Создать шаблон
          </Link>
          <Link to="/start">К запуску тренировки</Link>
          <Link to="/workouts">История</Link>
        </div>
      </header>

      {isLoading ? <p>Загрузка...</p> : null}
      {isError ? <p>Ошибка: {error?.message ?? "Не удалось загрузить шаблоны"}</p> : null}
      {deleteMutation.isError ? (
        <p>Ошибка: {deleteMutation.error?.message ?? "Не удалось удалить шаблон"}</p>
      ) : null}

      {data && data.length === 0 ? <p>Шаблоны пока не созданы.</p> : null}

      <ul>
        {data?.map((template) => (
          <li key={template.id ?? template.name ?? "template-without-id"}>
            <div>
              <strong>{template.name ?? "Без названия"}</strong>
              <span>Упражнений: {template.exercises?.length ?? 0}</span>
            </div>
            <button
              type="button"
              onClick={() => handleEdit(template.id)}
              disabled={deleteMutation.isPending}
            >
              Изменить
            </button>
            <button
              type="button"
              onClick={() => handleDelete(template.id)}
              disabled={deleteMutation.isPending}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
