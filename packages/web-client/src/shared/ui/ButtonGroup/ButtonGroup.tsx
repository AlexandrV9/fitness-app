import clsx from "clsx";
import type { PropsWithChildren } from "react";

import { Flex } from '../Flex';

import styles from './ButtonGroup.module.css';

export type ButtonGroupProps = PropsWithChildren<{
  className?: string;
  align?: ButtonGroupAlign;
  fullWidth?: boolean;
}>;

type ButtonGroupAlign = 'left' | 'center' | 'right';

export const ButtonGroup = ({
  className,
  children,
  align = 'center',
  fullWidth = false,
}: ButtonGroupProps) => {
  return (
    <Flex
      className={clsx(
        styles.root,
        {
          [styles.center]: align === 'center',
          [styles.right]: align === 'right',
        },
        fullWidth && styles.fullWidth,
        className
      )}
      direction="column"
      rowGap={16}
    >
      {children}
    </Flex>
  );
};
