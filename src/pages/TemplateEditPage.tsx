import type { ReactElement } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useTemplateQuery } from "../features/templates/queries";

const parseTemplateId = (templateIdParam: string | undefined): number | null => {
  if (typeof templateIdParam !== "string") {
    return null;
  }

  const parsedTemplateId: number = Number(templateIdParam);

  return Number.isInteger(parsedTemplateId) ? parsedTemplateId : null;
};

export const TemplateEditPage = (): ReactElement => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const templateId: number | null = parseTemplateId(params.id);
  const { data, isLoading, isError, error } = useTemplateQuery(templateId);

  return (
    <section>
      <header>
        <h1>Редактирование шаблона</h1>
      </header>

      {templateId === null ? <p>Некорректный идентификатор шаблона.</p> : null}
      {isLoading ? <p>Загрузка шаблона...</p> : null}
      {isError ? <p>Ошибка: {error?.message ?? "Не удалось загрузить шаблон"}</p> : null}

      {data ? (
        <>
          <p>
            <strong>Название:</strong> {data.name ?? "Без названия"}
          </p>
          <section>
            <h2>Упражнения (скоро)</h2>
            <p>Редактирование упражнений будет добавлено в следующих шагах.</p>
          </section>
        </>
      ) : null}

      <button type="button" onClick={() => navigate("/templates")}>Назад</button>
      <Link to="/templates">К списку шаблонов</Link>
    </section>
  );
};
