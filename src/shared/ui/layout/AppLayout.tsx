import type { ReactElement, ReactNode } from "react";

import { FooterNav } from "../../../widgets/nav/FooterNav";

type SharedAppLayoutProps = {
  children: ReactNode;
};

export const SharedAppLayout = ({ children }: SharedAppLayoutProps): ReactElement => {
  return (
    <div className="ui-app-layout">
      <div className="ui-app-layout__content">{children}</div>
      <FooterNav />
    </div>
  );
};
