import type { InputHTMLAttributes, ReactElement } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = ({ label, error, className, id, ...rest }: InputProps): ReactElement => {
  const inputClasses = ["ui-input", error ? "ui-input--error" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <label className="ui-input-field" htmlFor={id}>
      {label ? <span className="ui-input-field__label">{label}</span> : null}
      <input id={id} className={inputClasses} {...rest} />
      {error ? <span className="ui-input-field__error">{error}</span> : null}
    </label>
  );
};
