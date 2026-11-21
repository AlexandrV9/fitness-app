import cn from "clsx";

import { CheckIcon } from "../../icons";
import { Typography } from "../../Typography";

import styles from "./Toggle.module.css";

export const SizeVariant = {
  s: "s",
  m: "m",
} as const;

export type ToggleProps = {
  className?: string;
  children: React.ReactNode;
  size?: keyof typeof SizeVariant;
  checked?: boolean;
  onChange?: (state?: string | boolean) => void;
};

const STATE = {
  checked: "checked",
  unchecked: "unchecked",
};

export const Toggle = ({
  className,
  children,
  size = "m",
  checked,
  onChange,
}: ToggleProps) => {
  const textSize = size === "m" ? "text_2" : "text_3";
  const iconSize = size === "m" ? 20 : 16;

  return (
    <span
      className={cn(className, styles.item)}
      data-state={checked ? STATE.checked : STATE.unchecked}
      onClick={() => onChange?.()}
    >
      <Typography variant={textSize} hasTextOverflow>
        {children}
      </Typography>
      <CheckIcon className={styles.checkIcon} size={iconSize} />
    </span>
  );
};

export const toggleStyles = styles;
