import type { CSSProperties, ReactElement, ReactNode } from "react";

type SkeletonLineProps = {
  width?: string;
  height?: string;
  radius?: string;
};

type SkeletonCardProps = {
  children?: ReactNode;
};

export const SkeletonLine = ({
  width = "100%",
  height = "14px",
  radius = "var(--radius-md)",
}: SkeletonLineProps): ReactElement => {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: radius,
  };

  return <div className="ui-skeleton-line" style={style} aria-hidden="true" />;
};

export const SkeletonCard = ({ children }: SkeletonCardProps): ReactElement => {
  return <div className="ui-skeleton-card">{children}</div>;
};
