const KEY = "theme_mode";

export type StoredTheme = "light" | "dark";

const isStoredTheme = (value: string): value is StoredTheme => {
  return value === "light" || value === "dark";
};

export const readTheme = (): StoredTheme | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(KEY);
  if (!stored || !isStoredTheme(stored)) {
    return null;
  }

  return stored;
};

export const writeTheme = (theme: StoredTheme): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(KEY, theme);
};
