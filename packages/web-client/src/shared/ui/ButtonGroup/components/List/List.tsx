import clsx from "clsx";
import type { PropsWithChildren } from "react";

import styles from './List.module.css';

export type ListProps = PropsWithChildren<{
  stretched?: boolean;
  vertical?: boolean;
  className?: string;
}>;

export const List = ({
  children,
  stretched = false,
  vertical = false,
  className,
}: ListProps) => {
  return (
    <div
      className={clsx(
        styles.root,
        stretched && styles.stretched,
        vertical && styles.vertical,
        className
      )}
    >
      {children}
    </div>
  );
};
