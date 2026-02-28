import type { ReactElement } from "react";

type AutosaveState = "idle" | "saving" | "saved" | "error";

type AutosaveIndicatorProps = {
  state: AutosaveState;
};

export const AutosaveIndicator = ({ state }: AutosaveIndicatorProps): ReactElement => {
  if (state === "saving") {
    return <span className="ui-autosave ui-autosave--saving" aria-label="Сохранение" />;
  }

  if (state === "saved") {
    return (
      <span className="ui-autosave ui-autosave--saved" aria-label="Сохранено">
        ✓
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="ui-autosave ui-autosave--error" aria-label="Ошибка сохранения">
        !
      </span>
    );
  }

  return <span className="ui-autosave ui-autosave--idle" aria-hidden="true" />;
};
