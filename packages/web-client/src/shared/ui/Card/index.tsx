import cx from "clsx";

import { Flex } from "../Flex";
import { Typography } from "../Typography";
import styles from "./Card.module.css";

import type { JSX, ReactNode } from "react";

export const CardVariant = {
  outline: "outline",
  primary: "primary",
} as const;

export type CardProps = {
  as?: keyof JSX.IntrinsicElements;
  variant?: keyof typeof CardVariant;
  children: ReactNode;
  className?: string;
};

export function Card({ as = "div", variant = "outline", children, className }: CardProps) {
  return (
    <Flex
      as={as}
      direction="column"
      rowGap={16}
      isFullWidth
      className={cx(styles.card, styles[`variant_${variant}`], className)}
    >
      {children}
    </Flex>
  );
}

export type CardTitleProps = { children: ReactNode };

const Title = ({ children }: CardTitleProps) => {
  return <Typography variant="h_2">{children}</Typography>;
};

export type CardHeaderProps = { children: ReactNode };

const Header = ({ children }: CardHeaderProps) => {
  return (
    <Flex justify="space-between" isFullWidth>
      {children}
    </Flex>
  );
};

export type CardBodyProps = { children: ReactNode };

const Body = ({ children }: CardBodyProps) => {
  return children;
};

Card.Header = Header;
Card.Title = Title;
Card.Body = Body;
