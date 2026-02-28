import type { ReactElement, ReactNode } from "react";

type SharedAppLayoutProps = {
  children: ReactNode;
};

export const SharedAppLayout = ({ children }: SharedAppLayoutProps): ReactElement => {
  return <div className="ui-app-layout">{children}</div>;
};
