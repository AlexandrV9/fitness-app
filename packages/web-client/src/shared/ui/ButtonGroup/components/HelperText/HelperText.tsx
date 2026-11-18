import clsx from "clsx";
import type { PropsWithChildren } from "react";

import { Typography } from '../../../Typography';

import styles from './HelperText.module.css';

export type HelperTextProps = PropsWithChildren<{
  variant?: HelperTextVariant;
}>;

type HelperTextVariant = 'default' | 'alert';

export const HelperText = ({
  children,
  variant = 'default',
}: HelperTextProps) => {
  return (
    <Typography
      className={clsx({
        [styles.default]: variant === 'default',
        [styles.alert]: variant === 'alert',
      })}
      variant="text_2"
      as="span"
    >
      {children}
    </Typography>
  );
};
