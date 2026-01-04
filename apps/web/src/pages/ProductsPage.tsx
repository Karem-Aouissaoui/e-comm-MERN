import { useEffect, useState } from "react";
import { api } from "../lib/api";

type Product = {
  _id: string;
  title: string;
  price: number;
  currency: string;
};

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/products");
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

  if (loading) return <p>Loading products…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h1>Products</h1>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((p) => (
          <li
            key={p._id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              marginBottom: 10,
            }}
          >
            <strong>{p.title}</strong>
            <div>
              {p.price} {p.currency}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
