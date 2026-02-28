import type { ReactElement, ReactNode } from "react";

import { Button } from "../button/Button";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps): ReactElement => {
  return (
    <div className="ui-empty-state" role="status" aria-live="polite">
      {icon ? <div className="ui-empty-state__icon">{icon}</div> : null}
      <h2 className="ui-empty-state__title">{title}</h2>
      {description ? <p className="ui-empty-state__description">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
