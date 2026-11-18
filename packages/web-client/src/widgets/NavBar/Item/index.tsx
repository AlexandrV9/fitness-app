import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { memo, type ReactNode } from "react";

import { Typography } from "~/shared/ui";

import styles from "./NavBarItem.module.css";

import type { IconProps } from "~/shared/ui/icons";

export type NavBarItemConfig = {
  id: string;
  title: string;
  href: string;
  icon: (props: IconProps) => ReactNode;
};

export type NavBarItemProps = NavBarItemConfig & {
  isActive?: boolean;
};

export const NavBarItem = memo(function NavBarItem({
  href,
  isActive,
  icon: Icon,
  title,
}: NavBarItemProps) {
  return (
    <li className={clsx(styles.container, isActive && styles.active)}>
      <Link to={href} className={styles.link}>
        <Icon size={24} className={styles.icon} />
        <Typography as="span" variant="text_3" className={styles.title}>
          {title}
        </Typography>
      </Link>
    </li>
  );
});
