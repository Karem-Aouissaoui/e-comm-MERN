import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import "./i18n";
import { queryClient } from "./lib/queryClient";
import { router } from "./router.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton />
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
