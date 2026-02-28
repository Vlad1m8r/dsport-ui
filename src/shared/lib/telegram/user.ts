import { getTelegramWebApp } from "../telegram";

export type TgUserView = {
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
};

export function getTgUserView(): TgUserView {
  const user = getTelegramWebApp()?.initDataUnsafe?.user;

  if (!user) {
    return {};
  }

  return {
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    photoUrl: user.photo_url,
  };
}
