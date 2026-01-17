import { QueryClient } from "@tanstack/react-query";

/**
 * Central QueryClient config.
 * - retry: keep conservative for auth flows (avoid repeated 401 loops)
 * - refetchOnWindowFocus: off for predictable UX in MVP
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
