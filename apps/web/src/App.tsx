import { BrowserRouter, Navigate, Route, Routes, Link } from "react-router-dom";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { SupplierInboxPage } from "./pages/SupplierInboxPage";
import { LoginPage } from "./pages/LoginPage";
import { ThreadPage } from "./pages/ThreadPage";
import { OrdersPage } from "./pages/OrdersPage";

/**
 * Minimal navigation bar for development.
 * Later we can replace with a proper layout + role-based menu.
 */
function Nav() {
  return (
    <div
      style={{
        padding: 12,
        borderBottom: "1px solid #ddd",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 12 }}
      >
        <Link to="/products">Products</Link>
        <Link to="/supplier/inbox">Supplier Inbox</Link>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

/**
 * App routes:
 * - Start at /login for MVP (so auth is explicit)
 * - Products are public
 * - Supplier inbox should require login (cookie must exist)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Nav />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/checkout/:orderId" element={<CheckoutPage />} />
        {/* Supplier page: will work only if you are logged in as supplier */}
        <Route path="/supplier/inbox" element={<SupplierInboxPage />} />
        <Route path="/threads/:threadId" element={<ThreadPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        {/*
        <Route path="/orders/:id" element={<OrderDetailPage />} />
       */}
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
