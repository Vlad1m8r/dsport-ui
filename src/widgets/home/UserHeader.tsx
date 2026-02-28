import type { ReactElement } from "react";

type UserHeaderProps = {
  displayName: string;
  photoUrl?: string;
  initials: string;
};

export const UserHeader = ({ displayName, photoUrl, initials }: UserHeaderProps): ReactElement => {
  const hasPhoto = typeof photoUrl === "string" && photoUrl.trim() !== "";

  return (
    <header className="home-user-header" aria-label="Профиль пользователя">
      <h1 className="home-user-header__name">{displayName}</h1>
      {hasPhoto ? (
        <img src={photoUrl} alt="" className="home-user-header__avatar-image" />
      ) : (
        <div className="home-user-header__avatar" aria-hidden>
          {initials}
        </div>
      )}
    </header>
  );
};
