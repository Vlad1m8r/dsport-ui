import { getTelegramWebApp, type TelegramInsets } from "../telegram";

const RESIZE_DEBOUNCE_MS = 80;

const toInsetPx = (value: number | undefined): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0px";
  }

  return `${Math.max(value, 0)}px`;
};

const setInsetVars = (safeInset?: TelegramInsets, contentInset?: TelegramInsets): void => {
  if (typeof document === "undefined") {
    return;
  }

  const rootStyle = document.documentElement.style;

  const safeTop = toInsetPx(safeInset?.top);
  const safeBottom = toInsetPx(safeInset?.bottom);
  const contentTop = toInsetPx(contentInset?.top);
  const contentBottom = toInsetPx(contentInset?.bottom);

  rootStyle.setProperty("--safe-top", safeTop);
  rootStyle.setProperty("--safe-bottom", safeBottom);
  rootStyle.setProperty("--content-top", contentTop);
  rootStyle.setProperty("--content-bottom", contentBottom);
  rootStyle.setProperty("--tg-safe-area-inset-top", safeTop);
  rootStyle.setProperty("--tg-safe-area-inset-bottom", safeBottom);
  rootStyle.setProperty("--tg-content-safe-area-inset-top", contentTop);
  rootStyle.setProperty("--tg-content-safe-area-inset-bottom", contentBottom);
};

export const applySafeAreaInsets = (): void => {
  const telegramWebApp = getTelegramWebApp();
  setInsetVars(telegramWebApp?.safeAreaInset, telegramWebApp?.contentSafeAreaInset);
};

export const bindViewportEvents = (): (() => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const handleResize = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      applySafeAreaInsets();
    }, RESIZE_DEBOUNCE_MS);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);
  }

  const telegramWebApp = getTelegramWebApp();
  telegramWebApp?.onEvent?.("viewportChanged", handleResize);

  return (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    }

    telegramWebApp?.offEvent?.("viewportChanged", handleResize);
  };
};
