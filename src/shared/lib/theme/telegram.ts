import { getTelegramWebApp, type TelegramThemeParams } from "../telegram";
import { setThemeMode } from "./mode";

const applyThemeParam = (cssVar: string, value: string | undefined): void => {
  if (typeof document === "undefined" || !value) {
    return;
  }

  document.documentElement.style.setProperty(cssVar, value);
};

const applyThemeVars = (themeParams: TelegramThemeParams): void => {
  applyThemeParam("--bg", themeParams.bg_color);
  applyThemeParam("--surface", themeParams.bg_color);
  applyThemeParam("--surface-2", themeParams.secondary_bg_color);
  applyThemeParam("--text", themeParams.text_color);
  applyThemeParam("--text-muted", themeParams.hint_color);

  if (themeParams.button_color) {
    applyThemeParam("--accent", themeParams.button_color);
  }

  if (themeParams.button_text_color) {
    applyThemeParam("--accent-contrast", themeParams.button_text_color);
  }
};

export const applyTelegramTheme = (): void => {
  const telegramWebApp = getTelegramWebApp();
  const themeParams = telegramWebApp?.themeParams;

  if (!themeParams) {
    return;
  }

  applyThemeVars(themeParams);
};

export const bindTelegramThemeEvents = (): (() => void) => {
  const telegramWebApp = getTelegramWebApp();

  if (!telegramWebApp?.onEvent) {
    return () => undefined;
  }

  const handleThemeChanged = (): void => {
    applyTelegramTheme();
    setThemeMode("telegram");
  };

  telegramWebApp.onEvent("themeChanged", handleThemeChanged);

  return (): void => {
    telegramWebApp.offEvent?.("themeChanged", handleThemeChanged);
  };
};
