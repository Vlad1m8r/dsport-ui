import type { HTMLAttributes, ReactElement, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "section" | "div" | "li";
  children: ReactNode;
};

export const Card = ({ as = "section", className, children, ...rest }: CardProps): ReactElement => {
  const Component = as;
  const classes = ["ui-card", className ?? ""].filter(Boolean).join(" ");

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
};
