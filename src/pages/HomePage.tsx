import type { ReactElement } from "react";
import { Link } from "react-router-dom";

import { useActiveWorkout } from "../features/workouts/history/queries";

export const HomePage = (): ReactElement => {
  const { data: activeWorkoutId, isLoading } = useActiveWorkout();

  const hasActiveWorkout = typeof activeWorkoutId === "number";
  const startLink = hasActiveWorkout ? `/workouts/${activeWorkoutId}` : "/start";
  const startLabel = hasActiveWorkout ? "Продолжить тренировку" : "Начать тренировку";

  return (
    <section className="home-page">
      <header className="home-page__profile">
        <div className="home-page__avatar" aria-hidden>
          👤
        </div>
        <div>
          <p className="home-page__label">Добро пожаловать</p>
          <h1 className="home-page__username">Пользователь</h1>
        </div>
      </header>

      <nav className="home-page__cta" aria-label="Главные действия">
        <Link to={startLink} className="home-page__cta-link" aria-busy={isLoading}>
          {startLabel}
        </Link>
        <Link to="/templates" className="home-page__cta-link">
          Шаблоны
        </Link>
        <Link to="/workouts" className="home-page__cta-link">
          История
        </Link>
      </nav>

      <section className="home-page__calendar" aria-label="Календарь">
        <h2>Календарь (скоро)</h2>
        <p>Скоро здесь появится календарь тренировок.</p>
      </section>
    </section>
  );
};
