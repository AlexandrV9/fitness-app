import { QueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "~/shared/api/getErrorMessage";
import { toast } from "~/shared/ui/Toast";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: false },
    mutations: { onError: (error) => toast.error(getErrorMessage(error)) },
  },
});
