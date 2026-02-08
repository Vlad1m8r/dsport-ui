import { useState, type ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useTemplatesQuery } from "../features/templates/queries";
import { useStartWorkout } from "../features/workouts/start/queries";

export const StartWorkoutPage = (): ReactElement => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useTemplatesQuery();
  const startWorkoutMutation = useStartWorkout();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const handleSelectTemplate = (templateId: number): void => {
    setSelectedTemplateId(templateId);
    setSelectionError(null);
  };

  const handleStart = (templateId: number | null): void => {
    setStartError(null);
    setSelectionError(null);

    startWorkoutMutation.mutate(
      { templateId },
      {
        onSuccess: (response) => {
          if (typeof response?.id === "number") {
            navigate(`/workouts/${response.id}`);
            return;
          }

          setStartError("Не удалось получить идентификатор тренировки.");
        },
      },
    );
  };

  const handleStartWithTemplate = (): void => {
    if (typeof selectedTemplateId !== "number") {
      setSelectionError("Выберите шаблон перед запуском.");
      return;
    }

    handleStart(selectedTemplateId);
  };

  const handleStartWithoutTemplate = (): void => {
    handleStart(null);
  };

  return (
    <section>
      <header>
        <h1>Старт тренировки</h1>
        <div>
          <Link to="/templates">К шаблонам</Link>
          <Link to="/workouts">История</Link>
        </div>
      </header>

      {isLoading ? <p>Загрузка шаблонов...</p> : null}
      {isError ? (
        <div>
          <p>Ошибка: {error?.message ?? "Не удалось загрузить шаблоны"}</p>
          <button type="button" onClick={() => refetch()}>
            Повторить
          </button>
        </div>
      ) : null}

      {data && data.length === 0 ? (
        <div>
          <p>Шаблонов нет.</p>
          <Link to="/templates">Перейти к созданию</Link>
        </div>
      ) : null}

      {data && data.length > 0 ? (
        <ul>
          {data.map((template, index) => {
            const templateId = template.id;
            const key = templateId ?? `${template.name ?? "template"}-${index}`;

            return (
              <li key={key}>
                <label>
                  <input
                    type="radio"
                    name="template"
                    value={templateId ?? ""}
                    checked={templateId === selectedTemplateId}
                    onChange={() => {
                      if (typeof templateId === "number") {
                        handleSelectTemplate(templateId);
                      }
                    }}
                    disabled={typeof templateId !== "number"}
                  />
                  <span>{template.name ?? "Без названия"}</span>
                </label>
                <span>Упражнений: {template.exercises?.length ?? 0}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {selectionError ? <p>{selectionError}</p> : null}
      {startWorkoutMutation.isError ? (
        <p>Ошибка: {startWorkoutMutation.error?.message ?? "Не удалось начать тренировку"}</p>
      ) : null}
      {startError ? <p>Ошибка: {startError}</p> : null}

      <div>
        <button
          type="button"
          onClick={handleStartWithTemplate}
          disabled={startWorkoutMutation.isPending || isLoading}
        >
          Начать по шаблону
        </button>
        <button
          type="button"
          onClick={handleStartWithoutTemplate}
          disabled={startWorkoutMutation.isPending}
        >
          Начать без шаблона
        </button>
      </div>
    </section>
  );
};
