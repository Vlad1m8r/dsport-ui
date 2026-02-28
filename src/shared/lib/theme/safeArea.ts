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

  rootStyle.setProperty("--safe-top", toInsetPx(safeInset?.top));
  rootStyle.setProperty("--safe-bottom", toInsetPx(safeInset?.bottom));
  rootStyle.setProperty("--content-top", toInsetPx(contentInset?.top));
  rootStyle.setProperty("--content-bottom", toInsetPx(contentInset?.bottom));
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
