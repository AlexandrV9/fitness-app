import cn from "clsx";

import { Button, type ButtonProps } from "../../Button";
import { ArrowSmallDownIcon } from "../../icons";

import styles from "./Trigger.module.css";

export type TriggerProps = {
  className?: string;
  highlightedBorder?: boolean;
  size?: "s" | "m" | "l";
  open?: boolean;
} & ButtonProps;

export const Trigger = ({
  className,
  children,
  highlightedBorder,
  size = "s",
  open = false,
  ...props
}: TriggerProps) => (
  <Button
    className={cn(styles.button, className)}
    rightIcon={<ArrowSmallDownIcon />}
    data-highlighted-border={highlightedBorder}
    data-size={size}
    data-state={open ? "open" : "closed"}
    variant="outline"
    {...props}
  >
    {children}
  </Button>
);
