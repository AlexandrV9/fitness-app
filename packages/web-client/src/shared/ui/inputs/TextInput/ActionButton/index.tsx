import clsx from "clsx";

import { Button, type ButtonProps } from "~/shared/ui/Button";

import styles from "./ActionButton.module.css";

export interface ActionButtonProps extends Omit<
  ButtonProps,
  "color" | "variant" | "underline" | "size"
> {}

export const ActionButton = ({ className, ...props }: ActionButtonProps) => {
  return (
    <Button
      variant="inline"
      color="link"
      underline={false}
      size="m"
      className={clsx(styles.button, className)}
      {...props}
    />
  );
};
