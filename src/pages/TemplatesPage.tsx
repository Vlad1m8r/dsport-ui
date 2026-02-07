import {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useTemplatesQuery,
} from "../features/templates/queries";

export const TemplatesPage = (): JSX.Element => {
  const { data, isLoading, isError, error } = useTemplatesQuery();
  const createMutation = useCreateTemplateMutation();
  const deleteMutation = useDeleteTemplateMutation();

  const handleCreate = (): void => {
    createMutation.mutate({
      name: "Новый шаблон",
      exercises: [],
    });
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
        <button type="button" onClick={handleCreate} disabled={createMutation.isPending}>
          Создать шаблон
        </button>
      </header>

      {isLoading ? <p>Загрузка...</p> : null}
      {isError ? <p>Ошибка: {error?.message ?? "Не удалось загрузить шаблоны"}</p> : null}
      {createMutation.isError ? (
        <p>Ошибка: {createMutation.error?.message ?? "Не удалось создать шаблон"}</p>
      ) : null}
      {deleteMutation.isError ? (
        <p>Ошибка: {deleteMutation.error?.message ?? "Не удалось удалить шаблон"}</p>
      ) : null}

      {data && data.length === 0 ? <p>Шаблоны пока не созданы.</p> : null}

      <ul>
        {data?.map((template, index) => (
          <li key={template.id ?? `${template.name ?? "template"}-${index}`}>
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
