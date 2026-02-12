import type { ReactElement } from "react";
import { Link } from "react-router-dom";

import { useActiveWorkout } from "../features/workouts/history/queries";
import { getTelegramUser } from "../shared/lib/telegram";

const getUserName = (username: string | undefined): string => {
  if (typeof username !== "string" || username.trim() === "") {
    return "пользователь";
  }

  return username.startsWith("@") ? username : `@${username}`;
};

export const HomePage = (): ReactElement => {
  const { data: activeWorkoutId, isLoading } = useActiveWorkout();
  const telegramUser = getTelegramUser();

  const hasActiveWorkout = typeof activeWorkoutId === "number";
  const startLink = hasActiveWorkout ? `/workouts/${activeWorkoutId}` : "/start";
  const startLabel = hasActiveWorkout ? "Продолжить тренировку" : "Начать тренировку";
  const username = getUserName(telegramUser?.username);
  const avatarUrl =
    typeof telegramUser?.photo_url === "string" && telegramUser.photo_url.trim() !== ""
      ? telegramUser.photo_url
      : null;

  return (
    <section className="home-page">
      <header className="home-page__profile">
        <div className="home-page__avatar" aria-hidden>
          {avatarUrl ? <img src={avatarUrl} alt="" className="home-page__avatar-image" /> : null}
        </div>
        <div>
          <p className="home-page__label">Добро пожаловать</p>
          <h1 className="home-page__username">{username}</h1>
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
