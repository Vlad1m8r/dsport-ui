import type { ReactElement, ReactNode } from "react";

type ActionTileProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export const ActionTile = ({ icon, label, onClick, disabled = false }: ActionTileProps): ReactElement => {
  return (
    <button type="button" className="home-action-tile glass" onClick={onClick} disabled={disabled}>
      <span className="home-action-tile__icon-wrapper" aria-hidden>
        {icon}
      </span>
      <span className="home-action-tile__label">{label}</span>
    </button>
  );
};
