import { withIconProps } from "../withIconProps";

export const SearchIcon = withIconProps((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M10.5 3a7.5 7.5 0 0 1 5.927 12.152l3.71 3.711a1 1 0 0 1-1.32 1.497l-.094-.083-3.711-3.71A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11Z" />
  </svg>
));
