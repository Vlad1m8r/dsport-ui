import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { Providers } from "./app/providers";
import { router } from "./app/router";
import { initThemeMode } from "./shared/lib/theme/mode";
import "./shared/ui/theme/tokens.css";
import "./shared/ui/styles/ui.css";
import "./index.css";

initThemeMode();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
