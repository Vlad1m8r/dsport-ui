import type { ReactElement } from "react";

import { ThemeToggle } from "../../shared/ui/theme/ThemeToggle";

type UserHeaderProps = {
  displayName: string;
  photoUrl?: string;
  initials: string;
};

export const UserHeader = ({ displayName, photoUrl, initials }: UserHeaderProps): ReactElement => {
  const hasPhoto = typeof photoUrl === "string" && photoUrl.trim() !== "";

  return (
    <header className="home-user-header" aria-label="Профиль пользователя">
      <div className="home-user-header__content">
        <p className="home-user-header__name" title={displayName}>
          {displayName}
        </p>
      </div>
      <div className="home-user-header__actions">
        <ThemeToggle />
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
