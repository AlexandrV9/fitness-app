import cx from 'clsx';

import { CloseCircleIcon } from "../../../icons/CloseCircle";
import type { ControlButtonProps } from "../types";

import styles from '../styles.module.css';

export const RemoveButton = ({
  className,
  size = 24,
  style,
  ...props
}: ControlButtonProps) => {
  return (
    <button
      className={cx(styles.button, className)}
      style={{
        ...{
          '--control-button-size': `${size}px`,
        },
        ...style,
      }}
      {...props}
    >
      <CloseCircleIcon size={size} />
    </button>
  );
};
