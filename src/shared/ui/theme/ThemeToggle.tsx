import { useState, type ReactElement } from "react";

import { getThemeMode, setThemeMode } from "../../lib/theme/mode";
import { IconButton } from "../button/IconButton";

const SunIcon = (): ReactElement => {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4V2M12 22V20M4 12H2M22 12H20M6.34 6.34L4.93 4.93M19.07 19.07L17.66 17.66M17.66 6.34L19.07 4.93M4.93 19.07L6.34 17.66M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const MoonIcon = (): ReactElement => {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12.79C20.8405 14.4922 20.1999 16.1144 19.1514 17.4643C18.1029 18.8141 16.6898 19.8357 15.0805 20.4084C13.4711 20.9812 11.7312 21.0812 10.0662 20.6969C8.40113 20.3126 6.87825 19.46 5.67593 18.2371C4.47362 17.0143 3.64669 15.4772 3.29056 13.8058C2.93444 12.1344 3.06399 10.3964 3.66461 8.79774C4.26524 7.19911 5.31033 5.80396 6.6773 4.77814C8.04428 3.75233 9.67762 3.13954 11.382 3.00999C10.384 4.36003 9.9032 6.02311 10.0251 7.69739C10.147 9.37167 10.8636 10.9489 12.0484 12.1336C13.2331 13.3184 14.8103 14.035 16.4846 14.1569C18.1589 14.2788 19.822 13.798 21.172 12.8L21 12.79Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ThemeToggle = (): ReactElement => {
  const [mode, setMode] = useState(getThemeMode);
  const isDark = mode === "dark";

  const handleToggle = (): void => {
    const nextMode = isDark ? "light" : "dark";
    setThemeMode(nextMode);
    setMode(nextMode);
  };

  return (
    <IconButton
      variant="secondary"
      icon={isDark ? <SunIcon /> : <MoonIcon />}
      label="Переключить тему"
      onClick={handleToggle}
    />
  );
};
