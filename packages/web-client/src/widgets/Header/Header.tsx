import clsx from "clsx";

import { Flex } from "~/shared/ui";

import styles from "./Header.module.css";
import { useHeaderStore } from "./useHeaderStore";

export const Header = () => {
  const { leftContent, centerContent, rightContent } = useHeaderStore();

  return (
    <Flex isFullWidth as="header" align="center" justify="center" className={styles.container}>
      <div className={clsx(styles.side, styles.left)}>{leftContent}</div>
      <div className={styles.center}>{centerContent}</div>
      <div className={clsx(styles.side, styles.right)}>{rightContent}</div>
    </Flex>
  );
};
