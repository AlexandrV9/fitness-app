import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { RouterContext } from "~/shared/libs";

const RootLayout = () => {
  return <Outlet />;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => <main>Страница не найдена</main>,
});
