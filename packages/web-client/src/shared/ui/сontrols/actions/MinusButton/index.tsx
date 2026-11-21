import { IconButton, type IconButtonProps } from "../../../IconButton";
import { MinusIcon } from "../../../icons";

export type MinusButtonProps = Omit<IconButtonProps, "children">;

export const MinusButton = ({
  "aria-label": ariaLabel = "Уменьшить",
  variant = "outline",
  size = "m",
  type = "button",
  ...props
}: MinusButtonProps) => {
  return (
    <IconButton aria-label={ariaLabel} variant={variant} size={size} type={type} {...props}>
      <MinusIcon />
    </IconButton>
  );
};
