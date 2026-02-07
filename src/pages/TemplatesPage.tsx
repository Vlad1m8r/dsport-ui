import { useState, type ReactElement } from "react";

import type { components } from "../shared/api/schema";
import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
} from "../features/templates/queries";
import "./TemplatesPage.css";

type TemplateCreateRequest = components["schemas"]["TemplateCreateRequest"];

type TemplateResponse = components["schemas"]["TemplateResponse"];

const buildPlaceholderTemplate = (name: string): TemplateCreateRequest => ({
  name,
  exercises: [],
});

const getTemplateKey = (template: TemplateResponse, index: number): string => {
  if (typeof template.id === "number") {
    return `template-${template.id}`;
  }

  if (template.name) {
    return `${template.name}-${index}`;
  }

  return `template-${index}`;
};

const getExercisesCount = (template: TemplateResponse): number => {
  return template.exercises?.length ?? 0;
};

const TemplatesPage = (): ReactElement => {
  const { data: templatesData, isLoading } = useTemplates();
  const createTemplateMutation = useCreateTemplate();
  const deleteTemplateMutation = useDeleteTemplate();
  const [name, setName] = useState<string>("");
  const templates: TemplateResponse[] = templatesData ?? [];

  const handleCreate = async (): Promise<void> => {
    const trimmedName = name.trim();
    const payload = buildPlaceholderTemplate(
      trimmedName || "Новый шаблон",
    );

    await createTemplateMutation.mutateAsync(payload);

    if (trimmedName) {
      setName("");
    }
  };

  const handleDelete = async (id?: number): Promise<void> => {
    if (typeof id !== "number") {
      return;
    }

    await deleteTemplateMutation.mutateAsync(id);
  };

  return (
    <section className="templates-page">
      <header className="templates-header">
        <h1 className="templates-title">Шаблоны тренировок</h1>
        <p className="templates-subtitle">
          Быстро запускайте тренировки по сохранённым шаблонам.
        </p>
      </header>

      <div className="templates-actions">
        <label className="templates-label" htmlFor="template-name">
          Название шаблона
        </label>
        <div className="templates-input-row">
          <input
            id="template-name"
            className="templates-input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например, Грудь и трицепс"
          />
          <button
            className="templates-button"
            type="button"
            onClick={() => void handleCreate()}
            disabled={createTemplateMutation.isPending}
          >
            Создать шаблон
          </button>
        </div>
      </div>

      <div className="templates-list">
        {isLoading && <div className="templates-empty">Загрузка...</div>}
        {!isLoading && templates.length === 0 && (
          <div className="templates-empty">Шаблонов пока нет.</div>
        )}
        {!isLoading &&
          templates.map((template, index) => (
            <article
              className="templates-card"
              key={getTemplateKey(template, index)}
            >
              <div className="templates-card-content">
                <h2 className="templates-card-title">
                  {template.name ?? "Без названия"}
                </h2>
                <p className="templates-card-meta">
                  Упражнений: {getExercisesCount(template)}
                </p>
              </div>
              <button
                className="templates-delete"
                type="button"
                onClick={() => void handleDelete(template.id)}
                disabled={deleteTemplateMutation.isPending || !template.id}
              >
                Удалить
              </button>
            </article>
          ))}
      </div>
    </section>
  );
};

export default TemplatesPage;
