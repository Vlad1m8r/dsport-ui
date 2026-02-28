import type { ReactElement } from "react";
import { Outlet } from "react-router-dom";

import { SharedAppLayout } from "../../shared/ui/layout/AppLayout";

export const AppLayout = (): ReactElement => {
  return (
    <SharedAppLayout>
      <Outlet />
    </SharedAppLayout>
  );
};
