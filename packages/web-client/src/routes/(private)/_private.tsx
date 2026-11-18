import { createFileRoute, redirect } from "@tanstack/react-router";

import { authManager, useAuthStore } from "~/features/auth";
import { buildLocationRedirectPath } from "~/shared/libs";

import { PrivateLayout } from "./_layout/PrivateLayout";

export const Route = createFileRoute("/(private)/_private")({
  beforeLoad: async ({ location }) => {
    if (useAuthStore.getState().status === "AUTHENTICATED") return;
    if (!(await authManager.checkAuth())) {
      throw redirect({
        to: "/signin",
        search: { redirect: buildLocationRedirectPath(location) },
      });
    }
  },
  component: PrivateLayout,
});
