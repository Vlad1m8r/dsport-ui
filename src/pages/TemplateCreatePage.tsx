import type { ReactElement } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCreateTemplateMutation } from "../features/templates/queries";

export const TemplateCreatePage = (): ReactElement => {
  const navigate = useNavigate();
  const createTemplateMutation = useCreateTemplateMutation();

  useEffect((): void => {
    createTemplateMutation.mutate(
      {
        name: "Новый шаблон",
        exercises: [],
      },
      {
        onSuccess: (template): void => {
          if (typeof template.id === "number") {
            navigate(`/templates/${template.id}/edit`, { replace: true });
          }
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <header>
        <h1>Создание шаблона</h1>
      </header>

      <p>Создаём шаблон и открываем редактор…</p>

      {createTemplateMutation.isError ? (
        <p>Ошибка: {createTemplateMutation.error?.message ?? "Не удалось создать шаблон"}</p>
      ) : null}

      <Link to="/templates">Вернуться к шаблонам</Link>
    </section>
  );
};
