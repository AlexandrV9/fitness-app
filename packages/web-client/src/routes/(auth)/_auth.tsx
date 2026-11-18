import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import { authManager, useAuthStore } from "~/features/auth";
import { AuthLayout } from "./_ui/AuthLayout";

export const Route = createFileRoute("/(auth)/_auth")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: async ({ search }) => {
    const authStatus = useAuthStore.getState().status;

    if (authStatus === "AUTHENTICATED") {
      throw redirect({ to: search.redirect || "/" });
    }

    if (authStatus === "IDLE") {
      const isAuthenticated = await authManager.checkAuth();

      if (isAuthenticated) {
        throw redirect({ to: search.redirect || "/" });
      }
    }
  },
  component: AuthLayout,
});
