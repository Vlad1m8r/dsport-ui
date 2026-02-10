import type { ReactElement } from "react";
import { Link } from "react-router-dom";

import {
  useDeleteTemplateMutation,
  useTemplatesQuery,
} from "../features/templates/queries";

export const TemplatesPage = (): ReactElement => {
  const { data, isLoading, isError, error } = useTemplatesQuery();
  const deleteMutation = useDeleteTemplateMutation();

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
