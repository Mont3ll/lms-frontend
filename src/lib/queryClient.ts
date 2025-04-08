import { QueryClient } from "@tanstack/react-query";

// Create a single instance for the app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Adjust as needed
      retry: 1, // Retry failed requests once
    },
  },
});
