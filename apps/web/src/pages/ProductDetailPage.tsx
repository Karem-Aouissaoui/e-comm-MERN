import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { formatMoney } from "../lib/money";
import type { Product } from "../types";

/**
 * Product detail page:
 * - Loads product details by id
 * - Lets buyer choose quantity
 * - Creates an order, then navigates to checkout
 */
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        const min = res.data?.minOrderQty ?? 1;
        setQty(min);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  /**
   * Opens (or creates) a pre-purchase product thread with the supplier,
   * then navigates to the thread page.
   */
  async function askSupplier() {
    // Guard: product must be loaded before we can use its _id
    if (!product) return;

    try {
      const res = await api.get(`/products/${product._id}/thread`);
      const threadId = res.data?.threadId;

      if (!threadId) {
        throw new Error("Server did not return threadId");
      }

      navigate(`/threads/${threadId}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to open product thread"
      );
    }
  }

  const totalPreview = useMemo(() => {
    if (!product) return "";
    return formatMoney(product.priceCents * qty, product.currency);
  }, [product, qty]);

  async function createOrder() {
    if (!product) return;
    setBusy(true);
    setError("");

    try {
      /**
       * Create order from backend.
       * Assumes POST /orders with { productId, quantity } is implemented.
       */
      const res = await api.post("/orders", {
        productId: product._id,
        quantity: qty,
      });

      const orderId = res.data?._id ?? res.data?.id ?? res.data?.orderId;
      if (!orderId) throw new Error("Order id not returned from server");

      // Go to checkout page
      navigate(`/checkout/${orderId}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Order creation failed"
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (error && !product)
    return <div style={{ padding: 24, color: "red" }}>{error}</div>;
  if (!product) return <div style={{ padding: 24 }}>Not found.</div>;

  const min = product.minOrderQty ?? 1;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <Link to="/products">← Back to products</Link>

      <h1 style={{ marginTop: 12 }}>{product.title}</h1>
      <div style={{ marginTop: 8, opacity: 0.85 }}>
        {product.description ?? ""}
      </div>

      <div style={{ marginTop: 16, fontWeight: 700 }}>
        Unit price: {formatMoney(product.priceCents, product.currency)}
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <label>
          Quantity (min {min})
          <input
            type="number"
            min={min}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(min, parseInt(e.target.value || "0", 10)))
            }
            style={{ display: "block", width: 140, padding: 10, marginTop: 6 }}
          />
        </label>

        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Total preview</div>
          <div style={{ fontWeight: 800 }}>{totalPreview}</div>
        </div>
      </div>
      {product && (
        <button onClick={askSupplier} style={{ padding: 10, fontWeight: 700 }}>
          Ask supplier
        </button>
      )}

      <button
        onClick={createOrder}
        disabled={busy}
        style={{ marginTop: 16, padding: 12, fontWeight: 700 }}
      >
        {busy ? "Creating order…" : "Continue to checkout"}
      </button>

      {error && <div style={{ marginTop: 12, color: "red" }}>{error}</div>}
    </div>
  );
}
