import { useEffect, type ReactElement, type ReactNode } from "react";

import { IconButton } from "../button/IconButton";

type ModalSheetProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export const ModalSheet = ({ isOpen, title, onClose, children }: ModalSheetProps): ReactElement | null => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="ui-sheet" role="dialog" aria-modal="true" aria-label={title ?? "Модальное окно"}>
      <button
        type="button"
        className="ui-sheet__backdrop"
        aria-label="Закрыть модальное окно"
        onClick={onClose}
      />
      <section className="ui-sheet__panel">
        <div className="ui-sheet__drag-indicator" />
        <header className="ui-sheet__header">
          {title ? <h2 className="ui-sheet__title">{title}</h2> : <span />}
          <IconButton variant="ghost" icon="✕" label="Закрыть" onClick={onClose} />
        </header>
        <div className="ui-sheet__content">{children}</div>
      </section>
    </div>
  );
};
