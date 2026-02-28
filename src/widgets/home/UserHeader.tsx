import { useEffect, useState, type ReactElement } from "react";

import { IconButton } from "../../shared/ui/button/IconButton";
import { MoonIcon, SunIcon } from "../../shared/ui/icons/ThemeIcons";

type UserHeaderProps = {
  displayName: string;
  photoUrl?: string;
  initials: string;
};

export const UserHeader = ({ displayName, photoUrl, initials }: UserHeaderProps): ReactElement => {
  const hasPhoto = typeof photoUrl === "string" && photoUrl.trim() !== "";
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const currentMode = document.documentElement.getAttribute("data-mode");
    setIsDark(currentMode === "dark");
  }, []);

  const toggleTheme = (): void => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-mode", newTheme);
  };

  return (
    <header className="home-user-header" aria-label="Профиль пользователя">
      <h1 className="home-user-header__name">{displayName}</h1>

      <div className="home-user-header__controls">
        <IconButton
          variant="secondary"
          icon={isDark ? <SunIcon /> : <MoonIcon />}
          label="Переключить тему"
          onClick={toggleTheme}
          className="home-user-header__theme-toggle"
        />

        {hasPhoto ? (
          <img src={photoUrl} alt="" className="home-user-header__avatar-image" />
        ) : (
          <div className="home-user-header__avatar" aria-hidden>
            {initials}
          </div>
        )}
      </div>
    </header>
  );
};
