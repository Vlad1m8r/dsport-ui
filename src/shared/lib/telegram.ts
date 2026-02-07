export type TelegramWebApp = {
  initData?: string;
};

type TelegramNamespace = {
  WebApp?: TelegramWebApp;
};

type TelegramWindow = Window & {
  Telegram?: TelegramNamespace;
};

export const getInitData = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const telegram = (window as TelegramWindow).Telegram;
  const initData = telegram?.WebApp?.initData;

  if (initData && initData.trim() !== "") {
    return initData;
  }

  if (import.meta.env.DEV) {
    // DEV ONLY: fallback user for local testing outside Telegram
    return "user=%7B%22id%22%3A12345%7D";
  }

  return "";
};
