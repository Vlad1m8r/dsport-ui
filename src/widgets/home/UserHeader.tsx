import { useEffect, useState, type ReactElement } from "react";

import { IconButton } from "../../shared/ui/button/IconButton";
import { MoonIcon, SunIcon } from "../../shared/ui/icons/ThemeIcons";
import {
  getThemeMode,
  subscribeThemeMode,
  toggleThemeMode,
  type ThemeMode,
} from "../../shared/lib/theme/mode";

type UserHeaderProps = {
  displayName: string;
  photoUrl?: string;
  initials: string;
};

export const UserHeader = ({ displayName, photoUrl, initials }: UserHeaderProps): ReactElement => {
  const hasPhoto = typeof photoUrl === "string" && photoUrl.trim() !== "";
  const [isDark, setIsDark] = useState<boolean>(getThemeMode() === "dark");

  useEffect(() => {
    const unsubscribe = subscribeThemeMode((mode: ThemeMode) => {
      setIsDark(mode === "dark");
    });

    return unsubscribe;
  }, []);

  const toggleTheme = (): void => {
    const nextMode = toggleThemeMode();
    setIsDark(nextMode === "dark");
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
