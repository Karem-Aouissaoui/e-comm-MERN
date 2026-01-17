import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { RequireAuth, RequireRole } from "./components/guards";

// Pages (use your existing ones)
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { SupplierInboxPage } from "./pages/SupplierInboxPage";
import { ThreadPage } from "./pages/ThreadPage";
import { OrdersPage } from "./pages/OrdersPage";
import { LoginPage } from "./pages/LoginPage";

import { MessagesPage } from "./pages/MessagesPage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Navigate to="/products" replace /> },

      { path: "/login", element: <LoginPage /> },

      { path: "/products", element: <ProductsPage /> },
      { path: "/products/:id", element: <ProductDetailPage /> },

      // Buyer orders
      {
        path: "/orders",
        element: (
          <RequireAuth>
            <RequireRole roles={["buyer"]}>
              <OrdersPage />
            </RequireRole>
          </RequireAuth>
        ),
      },

      // Checkout: buyer only (recommended)
      {
        path: "/checkout/:orderId",
        element: (
          <RequireAuth>
            <RequireRole roles={["buyer"]}>
              <CheckoutPage />
            </RequireRole>
          </RequireAuth>
        ),
      },

      // Threads: buyer or supplier
      {
        path: "/threads/:threadId",
        element: (
          <RequireAuth>
            <ThreadPage />
          </RequireAuth>
        ),
      },

      // Supplier inbox
      {
        path: "/supplier/inbox",
        element: (
          <RequireAuth>
            <RequireRole roles={["supplier"]}>
              <SupplierInboxPage />
            </RequireRole>
          </RequireAuth>
        ),
      },

      {
        path: "/messages",
        element: (
          <RequireAuth>
          <MessagesPage />
          </RequireAuth>
        ),
      },
    ],
  },
]);
