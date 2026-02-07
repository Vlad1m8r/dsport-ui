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

  return initData ?? "";
};
