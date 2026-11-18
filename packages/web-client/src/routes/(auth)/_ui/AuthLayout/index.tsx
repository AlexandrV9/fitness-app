import { Outlet } from "@tanstack/react-router";

import styles from "./AuthLayout.module.css";

export function AuthLayout() {
  return (
    <div className={styles.page}>
      <Outlet />
    </div>
  );
}
