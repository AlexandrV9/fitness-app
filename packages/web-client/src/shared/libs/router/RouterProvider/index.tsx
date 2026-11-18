import {
  RouterProvider as BaseRouterProvider,
  createRouter,
} from "@tanstack/react-router";
import { routeTree } from "~/routeTree.gen";
import { queryClient } from "~/shared/config";
import type { RouterContext } from "./types";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingMs: 150,
  context: {
    queryClient,
  } satisfies RouterContext,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const RouterProvider = () => {
  return <BaseRouterProvider router={router} context={{ queryClient }} />;
};
