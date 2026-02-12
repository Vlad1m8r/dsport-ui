import type { ReactElement } from "react";
import { Outlet } from "react-router-dom";

import { AppHeader } from "../../components/AppHeader";

export const AppLayout = (): ReactElement => {
  return (
    <div className="app-layout">
      <AppHeader />
      <Outlet />
    </div>
  );
};
