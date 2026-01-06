import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { formatMoney } from "../lib/money";
import type { Product } from "../types";

/**
 * Public products browsing page.
 * Calls GET /products and shows basic cards.
 */
export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/products");
        // Expecting { items: Product[] } from backend list()
        setItems(res.data.items ?? []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading products…</div>;
  if (error) return <div style={{ padding: 24, color: "red" }}>{error}</div>;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <h1>Products</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((p) => (
          <Link
            key={p._id}
            to={`/products/${p._id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 700 }}>{p.title}</div>
            <div style={{ marginTop: 6 }}>
              {formatMoney(p.priceCents, p.currency)}
            </div>
            <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>
              {p.category ?? "—"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
