import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

export const AppHeader = (): ReactElement => {
  const navigate = useNavigate();

  return (
    <header className="app-header" aria-label="Навигация приложения">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="app-header__button"
        aria-label="Назад"
      >
        Назад
      </button>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="app-header__button"
        aria-label="На главную"
      >
        Главная
      </button>
    </header>
  );
};
