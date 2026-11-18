import cx from "clsx";
import type { HTMLAttributes, JSX, ReactNode, CSSProperties } from "react";

import styles from './Flex.module.css';

export type FlexProps = HTMLAttributes<HTMLOrSVGElement> & {
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  children: ReactNode;
  direction?: CSSProperties['flexDirection'];
  wrap?: CSSProperties['flexWrap'];
  rowGap?: CSSProperties['rowGap'];
  columnGap?: CSSProperties['columnGap'];
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  shrink?: CSSProperties['flexShrink'];
  isFullWidth?: boolean;
};

export const Flex = ({
  children,
  as: Tag = 'div',
  direction = 'row',
  className,
  wrap,
  rowGap = 0,
  columnGap = 0,
  justify,
  align,
  style,
  shrink,
  isFullWidth,
  ...otherProps
}: FlexProps) => {
  return (
    <Tag
      className={cx(styles.flex, className)}
      style={{
        ...{
          '--column-gap': `${columnGap}px`,
          '--row-gap': `${rowGap}px`,
          '--wrap': wrap,
          '--justify-content': justify,
          '--align-items': align,
          '--direction': direction,
          '--shrink': shrink,
          '--width': isFullWidth ? '100%' : 'auto',
        },
        ...style,
      }}
      {...otherProps}
    >
      {children}
    </Tag>
  );
};
