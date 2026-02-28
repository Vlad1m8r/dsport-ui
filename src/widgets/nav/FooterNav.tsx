import type { ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../shared/ui/button/Button";

export const FooterNav = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  const handleBack = (): void => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <nav className="footer-nav" aria-label="Нижняя навигация">
      <div className="footer-nav__inner">
        <Button variant="ghost" className="footer-nav__button" onClick={handleBack}>
          <span className="footer-nav__button-label">Назад</span>
        </Button>
        <Button
          variant="ghost"
          className={`footer-nav__button ${isHome ? "footer-nav__button--active" : ""}`}
          onClick={() => navigate("/")}
        >
          <span className="footer-nav__button-label">Главная</span>
        </Button>
        <Button variant="ghost" className="footer-nav__button" disabled>
          <span className="footer-nav__button-label">AI</span>
        </Button>
      </div>
    </nav>
  );
};
