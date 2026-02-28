import { readTheme, writeTheme } from "./storage";

export type ThemeMode = "light" | "dark";

const resolveSystemMode = (): ThemeMode => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const isThemeMode = (value: string): value is ThemeMode => {
  return value === "light" || value === "dark";
};

export const getThemeMode = (): ThemeMode => {
  if (typeof document === "undefined") {
    return "light";
  }

  const mode = document.documentElement.dataset.mode;
  return mode && isThemeMode(mode) ? mode : "light";
};

export const setThemeMode = (mode: ThemeMode): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.mode = mode;
  writeTheme(mode);
};

export const initThemeMode = (): void => {
  const storedMode = readTheme();

  if (storedMode) {
    setThemeMode(storedMode);
    return;
  }

  setThemeMode(resolveSystemMode());
};
