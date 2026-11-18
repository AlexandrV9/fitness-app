import clsx from "clsx";
import type { PropsWithChildren } from "react";

import {
  Button as _Button,
  type ButtonProps as _ButtonProps,
} from "../../../Button";

import styles from './Button.module.css';

export type ButtonProps = PropsWithChildren<
  Omit<_ButtonProps, 'fullWidth'> & { stretched?: boolean }
>;

export const Button = ({
  className,
  children,
  size = 'm',
  stretched = false,
  ...props
}: ButtonProps) => (
  <_Button
    className={clsx(styles.root, stretched && styles.stretched, className)}
    size={size}
    fullWidth={stretched}
    {...props}
  >
    {children}
  </_Button>
);
