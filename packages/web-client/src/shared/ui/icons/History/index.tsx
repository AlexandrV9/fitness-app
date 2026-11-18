import { withIconProps } from "../withIconProps";

export const HistoryIcon = withIconProps((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 9.95 11h-2.02A8 8 0 1 1 12 4a7.9 7.9 0 0 1 5.66 2.34L15 9h7V2l-2.76 2.76A9.96 9.96 0 0 0 12 2Zm1 5v5.41l3.3 3.3l-1.42 1.42L11 13.17V7h2Z" />
  </svg>
));
