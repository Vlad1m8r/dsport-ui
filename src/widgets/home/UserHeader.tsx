import { useEffect, useState, type ReactElement } from "react";

import { IconButton } from "../../shared/ui/button/IconButton";

type UserHeaderProps = {
  displayName: string;
  photoUrl?: string;
  initials: string;
};

const SunIcon = (): ReactElement => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = (): ReactElement => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

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
