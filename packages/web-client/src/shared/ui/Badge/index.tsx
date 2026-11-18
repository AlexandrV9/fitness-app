import cx from 'clsx';

import typographyStyles from '../Typography/Typography.module.css';
import styles from './Badge.module.css';

export const BadgeDotSize = {
  xl: 'xl',
  l: 'l',
  m: 'm',
  s: 's',
} as const;

export const BadgeColor = {
  blue: 'blue',
  green: 'green',
  purple: 'purple',
  red: 'red',
  yellow: 'yellow',
  accent: 'accent',
  secondary: 'secondary',
  greenPale: 'greenPale',
  bluePale: 'bluePale',
  default: 'default',
  white: 'white',
  grey: 'grey',
} as const;

export type BadgeColorType = keyof typeof BadgeColor;

interface BadgeProps {
  className?: string;
  color?: keyof typeof BadgeColor;
  children?: React.ReactNode;
  badgeDotSize?: keyof typeof BadgeDotSize;
}

export const Badge = ({
  color = 'default',
  children,
  className,
  badgeDotSize = 'm',
}: BadgeProps) => {
  return (
    <span
      className={cx(
        styles.badge,
        styles[`color_${color}`],
        {
          [styles[`size_${badgeDotSize}`]]: !children,
          [styles.badge_empty]: typeof children === 'undefined',
        },
        typographyStyles.text_controls,
        className
      )}
    >
      {children}
    </span>
  );
};
