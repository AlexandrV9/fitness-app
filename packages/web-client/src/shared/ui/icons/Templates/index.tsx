import { withIconProps } from "../withIconProps";

export const TemplatesIcon = withIconProps((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7Zm0 2h10v14H7V5Zm2 2v2h6V7H9Zm0 4v2h6v-2H9Zm0 4v2h4v-2H9Z" />
  </svg>
));
