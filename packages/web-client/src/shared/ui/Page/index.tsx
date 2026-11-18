import { Flex } from "../Flex";
import { Typography } from "../Typography";
import styles from "./Page.module.css";

import type { ReactNode } from "react";

export function Page({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Flex direction="column" rowGap={20}>
      <Flex
        as="header"
        align="center"
        justify="space-between"
        wrap="wrap"
        rowGap={12}
        columnGap={12}
      >
        <Typography variant="h_1">{title}</Typography>
        {actions}
      </Flex>
      {children}
    </Flex>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Flex as="section" direction="column" rowGap={16} className={styles.card}>
      {title && <Typography variant="h_2">{title}</Typography>}
      {children}
    </Flex>
  );
}
