import type { ChangeEvent, ReactElement } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCreateTemplateMutation } from "../features/templates/queries";

export const TemplateCreatePage = (): ReactElement => {
  const [name, setName] = useState<string>("");
  const createTemplateMutation = useCreateTemplateMutation();
  const navigate = useNavigate();

  const isNameEmpty: boolean = name.trim().length === 0;

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const handleCreate = (): void => {
    if (isNameEmpty) {
      return;
    }

    createTemplateMutation.mutate(
      {
        name: name.trim(),
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
    <section>
      <header>
        <h1>Новый шаблон</h1>
      </header>

      <div>
        <label htmlFor="template-name">Название шаблона</label>
        <input
          id="template-name"
          name="template-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Например: Грудь + трицепс"
          aria-required
        />
      </div>

      <div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isNameEmpty || createTemplateMutation.isPending}
        >
          Создать
        </button>
        <Link to="/templates">Назад к шаблонам</Link>
      </div>

      {createTemplateMutation.isError ? (
        <p>Ошибка: {createTemplateMutation.error?.message ?? "Не удалось создать шаблон"}</p>
      ) : null}
    </section>
  );
};
