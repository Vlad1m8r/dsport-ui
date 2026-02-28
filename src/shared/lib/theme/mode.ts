import { readTheme, writeTheme } from "./storage";

export type ThemeMode = "light" | "dark";

const THEME_MODE_CHANGED_EVENT = "theme-mode-changed";

const resolveSystemMode = (): ThemeMode => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const isThemeMode = (value: string): value is ThemeMode => {
  return value === "light" || value === "dark";
};

const emitThemeModeChanged = (mode: ThemeMode): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_MODE_CHANGED_EVENT, { detail: mode }));
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
  emitThemeModeChanged(mode);
};

export const toggleThemeMode = (): ThemeMode => {
  const nextMode: ThemeMode = getThemeMode() === "dark" ? "light" : "dark";
  setThemeMode(nextMode);
  return nextMode;
};

export const subscribeThemeMode = (listener: (mode: ThemeMode) => void): (() => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleThemeModeChange = (event: Event): void => {
    const customEvent = event as CustomEvent<ThemeMode>;
    listener(customEvent.detail);
  };

  window.addEventListener(THEME_MODE_CHANGED_EVENT, handleThemeModeChange);
  return () => {
    window.removeEventListener(THEME_MODE_CHANGED_EVENT, handleThemeModeChange);
  };
};

export const initThemeMode = (): void => {
  const storedMode = readTheme();

  if (storedMode) {
    setThemeMode(storedMode);
    return;
  }

  setThemeMode(resolveSystemMode());
};
