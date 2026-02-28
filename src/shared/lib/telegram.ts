export type TelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
};

export type TelegramThemeParams = {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  button_color?: string;
  button_text_color?: string;
};

export type TelegramInsets = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

type TelegramEventName = "themeChanged" | "viewportChanged";
type TelegramEventHandler = () => void;

export type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  colorScheme?: "light" | "dark";
  themeParams?: TelegramThemeParams;
  safeAreaInset?: TelegramInsets;
  contentSafeAreaInset?: TelegramInsets;
  ready?: () => void;
  expand?: () => void;
  onEvent?: (event: TelegramEventName, handler: TelegramEventHandler) => void;
  offEvent?: (event: TelegramEventName, handler: TelegramEventHandler) => void;
  enableVerticalSwipes?: () => void;
  disableVerticalSwipes?: () => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
};

type TelegramNamespace = {
  WebApp?: TelegramWebApp;
};

type TelegramWindow = Window & {
  Telegram?: TelegramNamespace;
};

export const getTelegramWebApp = (): TelegramWebApp | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (window as TelegramWindow).Telegram?.WebApp;
};

export const prepareTelegramWebApp = (): void => {
  const telegramWebApp = getTelegramWebApp();
  telegramWebApp?.ready?.();
  telegramWebApp?.expand?.();
};

export const getInitData = (): string => {
  const telegramWebApp = getTelegramWebApp();
  const initData = telegramWebApp?.initData;

  if (initData && initData.trim() !== "") {
    return initData;
  }

  if (import.meta.env.DEV) {
    // DEV ONLY: fallback user for local testing outside Telegram
    return "user=%7B%22id%22%3A12345%7D";
  }

  return "";
};

export const getTelegramUser = (): TelegramUser | null => {
  const user = getTelegramWebApp()?.initDataUnsafe?.user;

  if (!user || typeof user.id !== "number") {
    return null;
  }

  return user;
};

export const setVerticalSwipesEnabled = (enabled: boolean): void => {
  const telegramWebApp = getTelegramWebApp();

  if (!telegramWebApp) {
    return;
  }

  try {
    if (enabled) {
      telegramWebApp.enableVerticalSwipes?.();
      return;
    }

    telegramWebApp.disableVerticalSwipes?.();
  } catch {
    // no-op: старые версии Telegram WebApp могут не поддерживать API.
  }
};

export const setClosingConfirmationEnabled = (enabled: boolean): void => {
  const telegramWebApp = getTelegramWebApp();

  if (!telegramWebApp) {
    return;
  }

  try {
    if (enabled) {
      telegramWebApp.enableClosingConfirmation?.();
      return;
    }

    telegramWebApp.disableClosingConfirmation?.();
  } catch {
    // no-op: старые версии Telegram WebApp могут не поддерживать API.
  }
};
