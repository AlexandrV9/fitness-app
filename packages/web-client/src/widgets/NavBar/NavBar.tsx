import { useLocation } from "@tanstack/react-router";
import clsx from "clsx";

import { navItems } from "./constants";
import { NavBarItem } from "./Item";
import styles from "./NavBar.module.css";

import type { CSSProperties, HTMLAttributes } from "react";

export type NavBarProps = HTMLAttributes<HTMLElement>;

export function NavBar({ className, ...props }: NavBarProps) {
  const location = useLocation();

  return (
    <nav aria-label="Основная навигация" className={clsx(styles.root, className)} {...props}>
      <ul className={styles.list} style={{ "--nav-items-count": navItems.length } as CSSProperties}>
        {navItems.map((item) => (
          <NavBarItem
            key={item.id}
            {...item}
            isActive={checkIsActive(item.href, location.pathname)}
          />
        ))}
      </ul>
    </nav>
  );
}

function checkIsActive(href: string, path: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}
