import type { PropsWithChildren, ReactElement } from "react";

export const SafeAreaContainer = ({ children }: PropsWithChildren): ReactElement => {
  return <div className="safeAreaContainer">{children}</div>;
};
