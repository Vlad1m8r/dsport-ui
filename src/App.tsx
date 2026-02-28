import { useEffect, type ReactElement } from "react";
import { Outlet } from "react-router-dom";

import {
  prepareTelegramWebApp,
  setClosingConfirmationEnabled,
  setVerticalSwipesEnabled,
} from "./shared/lib/telegram";
import { applySafeAreaInsets, bindViewportEvents } from "./shared/lib/theme/safeArea";
import "./App.css";

function App(): ReactElement {
  useEffect(() => {
    prepareTelegramWebApp();
    setVerticalSwipesEnabled(false);
    setClosingConfirmationEnabled(true);
    applySafeAreaInsets();

    const cleanups: Array<() => void> = [bindViewportEvents()];

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
