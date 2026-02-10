import { useEffect, useMemo, useState, type ChangeEvent, type ReactElement } from "react";

import type { ExercisesCatalogResponse } from "./api";
import { useExercisesCatalog, useMuscleGroups } from "./queries";

import "./ExercisePicker.css";

type ScopeFilter = "ALL" | "SYSTEM" | "MY";

type ExerciseCatalogItem = ExercisesCatalogResponse[number];

type PreparedExercise = ExerciseCatalogItem & {
  nameLower: string;
};

interface ExercisePickerProps {
  mode: "template" | "workout" | null;
  onSelectExercise: (exerciseId: number) => void;
}

const SEARCH_DEBOUNCE_MS = 200;

const normalizeString = (value: string | undefined): string => {
  return (value ?? "").trim().toLowerCase();
};

const isScopeFilter = (value: string): value is ScopeFilter => {
  return value === "ALL" || value === "SYSTEM" || value === "MY";
};

export const ExercisePicker = ({ mode, onSelectExercise }: ExercisePickerProps): ReactElement => {
  const exercisesQuery = useExercisesCatalog();
  const muscleGroupsQuery = useMuscleGroups();

  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("ALL");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>("");

  useEffect((): (() => void) => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const preparedExercises = useMemo<PreparedExercise[]>(() => {
    const exercises = exercisesQuery.data ?? [];

    return exercises.map((exercise) => ({
      ...exercise,
      nameLower: normalizeString(exercise.name),
    }));
  }, [exercisesQuery.data]);

  const filteredExercises = useMemo<PreparedExercise[]>(() => {
    const normalizedSearch = normalizeString(debouncedSearch);

    return preparedExercises.filter((exercise) => {
      const matchesSearch =
        normalizedSearch.length === 0 || exercise.nameLower.includes(normalizedSearch);
      const matchesScope = scopeFilter === "ALL" || exercise.scope === scopeFilter;
      const matchesMuscleGroup =
        muscleGroupFilter.length === 0 ||
        (exercise.muscleGroups ?? []).includes(muscleGroupFilter);

      return matchesSearch && matchesScope && matchesMuscleGroup;
    });
  }, [debouncedSearch, muscleGroupFilter, preparedExercises, scopeFilter]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchInput(event.target.value);
  };

  const handleScopeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value;

    if (isScopeFilter(value)) {
      setScopeFilter(value);
    }
  };

  const handleMuscleGroupChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setMuscleGroupFilter(event.target.value);
  };

  if (exercisesQuery.isLoading || muscleGroupsQuery.isLoading) {
    return <p>Загрузка упражнений...</p>;
  }

  if (exercisesQuery.isError) {
    return <p>Ошибка загрузки упражнений: {exercisesQuery.error.message}</p>;
  }

  if (muscleGroupsQuery.isError) {
    return <p>Ошибка загрузки групп мышц: {muscleGroupsQuery.error.message}</p>;
  }

  const muscleGroups = muscleGroupsQuery.data ?? [];

  return (
    <section className="exercise-picker">
      <header className="exercise-picker__header">
        <h1>Выбор упражнения</h1>
        <p>Режим: {mode ?? "не указан"}</p>
      </header>

      <div className="exercise-picker__filters">
        <label className="exercise-picker__field" htmlFor="exercise-search-input">
          Поиск по названию
          <input
            id="exercise-search-input"
            type="search"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Например, Bench Press"
          />
        </label>

        <label className="exercise-picker__field" htmlFor="exercise-scope-filter">
          Scope
          <select id="exercise-scope-filter" value={scopeFilter} onChange={handleScopeChange}>
            <option value="ALL">ALL</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="MY">MY</option>
          </select>
        </label>

        <label className="exercise-picker__field" htmlFor="exercise-muscle-group-filter">
          Группа мышц
          <select
            id="exercise-muscle-group-filter"
            value={muscleGroupFilter}
            onChange={handleMuscleGroupChange}
          >
            <option value="">Все группы</option>
            {muscleGroups.map((group) => (
              <option key={group.code ?? "muscle-group-without-code"} value={group.code ?? ""}>
                {group.code ?? "Без кода"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="exercise-picker__count">Найдено: {filteredExercises.length}</p>

      <ul className="exercise-picker__list" aria-label="Список упражнений">
        {filteredExercises.map((exercise) => {
          if (typeof exercise.id !== "number") {
            return null;
          }

          const exerciseId = exercise.id;

          return (
            <li key={exerciseId}>
              <button
                className="exercise-picker__item"
                type="button"
                onClick={() => onSelectExercise(exerciseId)}
              >
                <span className="exercise-picker__item-title">{exercise.name ?? "Без названия"}</span>
                <span className="exercise-picker__item-meta">
                  {exercise.scope ?? "UNKNOWN"} · {(exercise.muscleGroups ?? []).join(", ") || "Без групп мышц"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
