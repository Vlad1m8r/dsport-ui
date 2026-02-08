import { useCallback, useEffect, type ReactElement } from "react";
import WebApp, { applyThemeParams } from "@twa-dev/sdk";
import { Outlet } from "react-router-dom";

import "./App.css";

const DEFAULT_THEME: Record<string, string> = {
  "--tg-theme-bg-color": "#ffffff",
  "--tg-theme-text-color": "#0f172a",
  "--tg-theme-hint-color": "#64748b",
  "--tg-theme-button-color": "#2563eb",
  "--tg-theme-button-text-color": "#ffffff",
  "--tg-theme-secondary-bg-color": "#e2e8f0",
  "--tg-theme-link-color": "#2563eb",
};

const extractThemeParams = (): Record<string, string> => {
  const nextTheme = { ...DEFAULT_THEME };

  if (WebApp.themeParams.bg_color) {
    nextTheme["--tg-theme-bg-color"] = WebApp.themeParams.bg_color;
  }
  if (WebApp.themeParams.text_color) {
    nextTheme["--tg-theme-text-color"] = WebApp.themeParams.text_color;
  }
  if (WebApp.themeParams.hint_color) {
    nextTheme["--tg-theme-hint-color"] = WebApp.themeParams.hint_color;
  }
  if (WebApp.themeParams.button_color) {
    nextTheme["--tg-theme-button-color"] = WebApp.themeParams.button_color;
  }
  if (WebApp.themeParams.button_text_color) {
    nextTheme["--tg-theme-button-text-color"] = WebApp.themeParams.button_text_color;
  }
  if (WebApp.themeParams.secondary_bg_color) {
    nextTheme["--tg-theme-secondary-bg-color"] = WebApp.themeParams.secondary_bg_color;
  }
  if (WebApp.themeParams.link_color) {
    nextTheme["--tg-theme-link-color"] = WebApp.themeParams.link_color;
  }

  return nextTheme;
};

function App(): ReactElement {
  const applyCssVariables = useCallback((variables: Record<string, string>): void => {
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    applyThemeParams(WebApp.themeParams);
    applyCssVariables(extractThemeParams());

    const handleThemeChange = (): void => {
      applyThemeParams(WebApp.themeParams);
      applyCssVariables(extractThemeParams());
    };

    WebApp.onEvent("themeChanged", handleThemeChange);

    return () => {
      WebApp.offEvent("themeChanged", handleThemeChange);
    };
  }, [applyCssVariables]);

  return (
    <main className="app">
      <Outlet />
    </main>
  );
}

export default App;
