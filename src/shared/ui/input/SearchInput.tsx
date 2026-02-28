import type { InputHTMLAttributes, ReactElement } from "react";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  onClear?: () => void;
};

export const SearchInput = ({ value, onClear, className, ...rest }: SearchInputProps): ReactElement => {
  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <div className={["ui-search", className ?? ""].filter(Boolean).join(" ")}>
      <span className="ui-search__icon" aria-hidden="true">
        🔍
      </span>
      <input type="search" className="ui-search__input" value={value} {...rest} />
      {hasValue ? (
        <button
          type="button"
          className="ui-search__clear"
          aria-label="Очистить поиск"
          onClick={onClear}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
};
