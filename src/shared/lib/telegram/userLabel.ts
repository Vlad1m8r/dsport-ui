import type { TgUserView } from "./user";

export function getDisplayName(user: TgUserView): string {
  if (user.username && user.username.trim() !== "") {
    return `@${user.username.trim()}`;
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  if (fullName !== "") {
    return fullName;
  }

  return "Пользователь";
}

export function getInitials(user: TgUserView): string {
  const first = user.firstName?.trim().charAt(0) ?? "";
  const last = user.lastName?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();

  if (initials !== "") {
    return initials;
  }

  if (user.username && user.username.trim() !== "") {
    return user.username.trim().charAt(0).toUpperCase();
  }

  return "U";
}
