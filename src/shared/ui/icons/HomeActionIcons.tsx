import type { ReactElement, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export const TemplatesIcon = (props: IconProps): ReactElement => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 9.5H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 13H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 16.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

export const StartIcon = (props: IconProps): ReactElement => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="9" width="4" height="6" rx="2" fill="currentColor" />
      <rect x="18" y="9" width="4" height="6" rx="2" fill="currentColor" />
      <rect x="6" y="7" width="3" height="10" rx="1.5" fill="currentColor" />
      <rect x="15" y="7" width="3" height="10" rx="1.5" fill="currentColor" />
      <rect x="9" y="10" width="6" height="4" rx="1" fill="currentColor" />
    </svg>
  );
};

export const HistoryIcon = (props: IconProps): ReactElement => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 9.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 13H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 16.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M15.5 10.5L16.8 11.8L18.8 9.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 14.5L16.8 15.8L18.8 13.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
