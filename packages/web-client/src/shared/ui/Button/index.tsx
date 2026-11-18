import cx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Typography, Variants } from "../Typography";

import styles from './Button.module.css';

export const ButtonSize = {
  xl: 'xl',
  l: 'l',
  m: 'm',
  s: 's',
} as const;

export const ButtonVariant = {
  default: 'default',
  outline: 'outline',
  empty: 'empty',
  inline: 'inline',
} as const;

export const ButtonColor = {
  primary: 'primary',
  secondary: 'secondary',
  accentPrimary: 'accentPrimary',
  accentSecondary: 'accentSecondary',
  alert: 'alert',
  link: 'link',
} as const;

const TextVariantByButtonSize: Record<
  keyof typeof ButtonSize,
  keyof typeof Variants
> = {
  [ButtonSize.xl]: 'h_4',
  [ButtonSize.l]: 'h_4',
  [ButtonSize.m]: 'text_6',
  [ButtonSize.s]: 'text_1',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<
  HTMLButtonElement | HTMLAnchorElement
> {
  children?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: keyof typeof ButtonSize;
  color?: keyof typeof ButtonColor;
  variant?: keyof typeof ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  underline?: boolean;
}

export const Button = ({
  variant = 'default',
  color = 'primary',
  size = 'l',
  className = '',
  children = null,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  underline = true,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cx(
        styles.button,
        {
          [styles[`color_${color}`]]: true,
          [styles[`size_${size}`]]: true,
          [styles[`variant_${variant}`]]: true,
          [styles.fullWidth]: fullWidth,
          [styles.underline]: underline,
        },
        className
      )}
      {...props}
    >
      {leftIcon && <span className={styles.left_icon}>{leftIcon}</span>}
      <Typography
        as="span"
        className={styles.text_wrapper}
        variant={TextVariantByButtonSize[size]}
      >
        {children}
      </Typography>
      {rightIcon && <span className={styles.right_icon}>{rightIcon}</span>}
    </button>
  );
};
