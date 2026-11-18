import "~/shared/config/axios";
import "~/shared/styles/variable.css";
import "./styles/normalize.css";
import "./styles/css-ios-pwa-viewport.css";
import "./styles/index.css";

import { ThemeProvider } from "~/shared/theme";
import { RouterProvider } from "~/shared/libs";
import { ToastContainer } from "~/shared/ui";
import { useDisableZoom } from "~/shared/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "~/shared/config";

export const App = () => {
  useDisableZoom();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider />
        <ToastContainer />
      </ThemeProvider>
    </QueryClientProvider>
  );
};
