import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

type IconButtonVariant = "ghost" | "secondary";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: IconButtonVariant;
  icon: ReactNode;
  label: string;
};

export const IconButton = ({
  variant = "ghost",
  className,
  icon,
  label,
  ...rest
}: IconButtonProps): ReactElement => {
  const classes = ["ui-icon-button", `ui-icon-button--${variant}`, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" aria-label={label} className={classes} {...rest}>
      {icon}
    </button>
  );
};
