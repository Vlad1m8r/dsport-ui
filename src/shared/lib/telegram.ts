export type TelegramUser = {
  id: number;
  username?: string;
  photo_url?: string;
};

export type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
};

type TelegramNamespace = {
  WebApp?: TelegramWebApp;
};

type TelegramWindow = Window & {
  Telegram?: TelegramNamespace;
};

const getTelegramWebApp = (): TelegramWebApp | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (window as TelegramWindow).Telegram?.WebApp;
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
