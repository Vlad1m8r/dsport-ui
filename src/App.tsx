import { useEffect, type ReactElement } from "react";
import { Outlet } from "react-router-dom";

import {
  getTelegramWebApp,
  prepareTelegramWebApp,
  setClosingConfirmationEnabled,
  setVerticalSwipesEnabled,
} from "./shared/lib/telegram";
import { initThemeMode } from "./shared/lib/theme/mode";
import { applySafeAreaInsets, bindViewportEvents } from "./shared/lib/theme/safeArea";
import {
  applyTelegramTheme,
  bindTelegramThemeEvents,
} from "./shared/lib/theme/telegram";
import "./App.css";

function App(): ReactElement {
  useEffect(() => {
    prepareTelegramWebApp();
    setVerticalSwipesEnabled(false);
    setClosingConfirmationEnabled(true);
    initThemeMode();
    applySafeAreaInsets();

    const cleanups: Array<() => void> = [bindViewportEvents()];

    if (getTelegramWebApp()) {
      applyTelegramTheme();
      cleanups.push(bindTelegramThemeEvents());
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <main className="app">
      <Outlet />
    </main>
  );
}

export default App;
