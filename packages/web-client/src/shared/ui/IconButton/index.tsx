import cx from 'clsx';

import { Badge, BadgeColor } from "../Badge";
import { Button, type ButtonProps } from "../Button";

import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<
  ButtonProps,
  'leftIcon' | 'rightIcon' | 'fullWidth' | 'href' | 'underline'
> {
  disabled?: boolean;
  withBadge?: boolean;
  badgeColor?: keyof typeof BadgeColor;
}

export const IconButton = ({
  size = 'l',
  className,
  withBadge,
  badgeColor = 'red',
  children,
  ...otherProps
}: IconButtonProps) => {
  return (
    <Button
      className={cx(styles.button, styles[`size_${size}`], className)}
      size={size}
      {...otherProps}
    >
      {children}
      {withBadge && (
        <div className={styles.badgeWrapper}>
          <Badge
            className={styles.badge}
            color={badgeColor}
            badgeDotSize={size}
          />
        </div>
      )}
    </Button>
  );
};
