import { withIconProps } from "../withIconProps";

export const MinusIcon = withIconProps((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M5 11H19V13H5V11Z" fill="currentColor" />
  </svg>
));
