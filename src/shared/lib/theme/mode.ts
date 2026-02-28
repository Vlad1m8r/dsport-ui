import { getTelegramWebApp } from "../telegram";

export type ThemeMode = "telegram" | "light" | "dark" | "auto";

type ResolvedMode = "light" | "dark";

const resolveAutoMode = (): ResolvedMode => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const resolveMode = (mode: ThemeMode): ResolvedMode => {
  if (mode === "light" || mode === "dark") {
    return mode;
  }

  if (mode === "telegram") {
    const telegramMode = getTelegramWebApp()?.colorScheme;
    if (telegramMode === "light" || telegramMode === "dark") {
      return telegramMode;
    }
  }

  return resolveAutoMode();
};

export const setThemeMode = (mode: ThemeMode): void => {
  if (typeof document === "undefined") {
    return;
  }

  const html = document.documentElement;
  html.dataset.theme = mode;
  html.dataset.mode = resolveMode(mode);
};

export const initThemeMode = (): void => {
  if (getTelegramWebApp()) {
    setThemeMode("telegram");
    return;
  }

  setThemeMode("auto");
};
