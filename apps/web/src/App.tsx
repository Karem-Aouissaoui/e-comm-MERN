import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";

/**
 * Minimal router for MVP:
 * - /products -> list
 * - /products/:id -> detail
 * - /checkout/:orderId -> payment
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/checkout/:orderId" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}
