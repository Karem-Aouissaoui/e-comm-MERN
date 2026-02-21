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
import { RegisterPage } from "./pages/RegisterPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { MessagesPage } from "./pages/MessagesPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { TermsPage } from "./pages/TermsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { SupplierDashboardPage } from "./pages/SupplierDashboardPage";
import { SupplierProductFormPage } from "./pages/SupplierProductFormPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Navigate to="/products" replace /> },

      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/terms", element: <TermsPage /> },
      { path: "/privacy", element: <PrivacyPage /> },

      { path: "/products", element: <ProductsPage /> },
      { path: "/products/:id", element: <ProductDetailPage /> },

      // Buyer orders
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
      {
        path: "/orders/:id",
        element: (
          <RequireAuth>
            <RequireRole roles={["buyer", "supplier"]}>
              <OrderDetailPage />
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

      // Supplier dashboard & product management
      {
        path: "/supplier/dashboard",
        element: (
          <RequireAuth>
            <RequireRole roles={["supplier"]}>
              <SupplierDashboardPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: "/supplier/products/new",
        element: (
          <RequireAuth>
            <RequireRole roles={["supplier"]}>
              <SupplierProductFormPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: "/supplier/products/:id/edit",
        element: (
          <RequireAuth>
            <RequireRole roles={["supplier"]}>
              <SupplierProductFormPage />
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
      {
        path: "/profile",
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
    ],
  },

  // ─── Admin Panel — uses its own AdminLayout (dark sidebar, no AppShell) ────
  {
    element: (
      <RequireAuth>
        <RequireRole roles={["admin"]}>
          <AdminLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },
      { path: "/admin/dashboard", element: <AdminDashboardPage /> },
      { path: "/admin/users",     element: <AdminUsersPage /> },
      { path: "/admin/products",  element: <AdminProductsPage /> },
      { path: "/admin/orders",    element: <AdminOrdersPage /> },
    ],
  },
]);
