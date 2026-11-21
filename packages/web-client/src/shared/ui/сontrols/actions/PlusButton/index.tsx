import { IconButton, type IconButtonProps } from "../../../IconButton";
import { PlusIcon } from "../../../icons";

export type PlusButtonProps = Omit<IconButtonProps, "children">;

export const PlusButton = ({
  "aria-label": ariaLabel = "Увеличить",
  variant = "outline",
  size = "m",
  type = "button",
  ...props
}: PlusButtonProps) => {
  return (
    <IconButton aria-label={ariaLabel} variant={variant} size={size} type={type} {...props}>
      <PlusIcon />
    </IconButton>
  );
};
