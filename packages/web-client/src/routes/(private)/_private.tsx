import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authManager, useAuthStore } from "~/features/auth";
import { buildLocationRedirectPath } from "~/shared/libs";
import styles from "./Private.module.css";

export const Route = createFileRoute("/(private)/_private")({
  beforeLoad: async ({ location }) => {
    const authStatus = useAuthStore.getState().status;
    const authRedirect = buildLocationRedirectPath(location);

    if (authStatus === "AUTHENTICATED") {
      return;
    }

    if (authStatus === "IDLE") {
      const isAuthenticated = await authManager.checkAuth();

      if (!isAuthenticated) {
        throw redirect({
          to: "/signin",
          search: { redirect: authRedirect },
        });
      }

      return;
    }

    if (authStatus === "UNAUTHENTICATED") {
      throw redirect({
        to: "/signin",
        search: { redirect: authRedirect },
      });
    }
  },
  component: PrivateLayout,
});

function PrivateLayout() {
  return (
    <div className={styles.page}>
      <Outlet />
    </div>
  );
}
