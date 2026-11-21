import { Switch as BaseSwitch } from "@ark-ui/react/switch";
import cn from "clsx";

import styles from "./Switch.module.css";

import type { ReactNode } from "react";

export type SwitchProps = {
  className?: string;
  children?: ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};

export const Switch = ({ className, checked, disabled, onChange }: SwitchProps) => {
  return (
    <BaseSwitch.Root
      className={cn(styles.root, className)}
      checked={Boolean(checked)}
      disabled={disabled}
      onCheckedChange={({ checked: nextChecked }) => onChange?.(nextChecked)}
    >
      <BaseSwitch.Control className={styles.control}>
        <BaseSwitch.Thumb className={styles.thumb} />
      </BaseSwitch.Control>
      <BaseSwitch.HiddenInput />
    </BaseSwitch.Root>
  );
};
