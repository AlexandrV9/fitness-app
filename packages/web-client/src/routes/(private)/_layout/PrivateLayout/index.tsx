import { Outlet } from "@tanstack/react-router";

import { SignOutButton, useAuthStore } from "~/features/auth";
import { Typography } from "~/shared/ui";
import { Header, NavBar, useHeaderLeftContent, useHeaderRightContent } from "~/widgets";

import styles from "./PrivateLayout.module.css";

export function PrivateLayout() {
  const status = useAuthStore((state) => state.status);
  const login = useAuthStore((state) => state.user?.login);

  useHeaderLeftContent(<Typography>{login}</Typography>);
  useHeaderRightContent(<SignOutButton />);

  if (status === "UNAUTHENTICATED") {
    return null;
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <NavBar />
    </div>
  );
}
