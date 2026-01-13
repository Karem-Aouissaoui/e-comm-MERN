import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

/**
 * Minimal Order type for the buyer list UI.
 * Keep it small; add fields later when needed.
 */
type BuyerOrder = {
  _id: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
  currency: string;
  createdAt?: string;
};

export function OrdersPage() {
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/orders/buyer");

      // Some APIs return { items: [...] }. If yours does, change this line.
      setOrders(res.data ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>My orders</h1>
        <Link to="/products">Back to products</Link>
      </div>

      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div>Loading…</div>
        ) : orders.length === 0 ? (
          <div style={{ opacity: 0.8 }}>
            You have no orders yet. <Link to="/products">Browse products</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {orders.map((o) => (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>Order</div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        opacity: 0.75,
                      }}
                    >
                      {o._id}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800 }}>
                      {(o.totalCents / 100).toFixed(2)} {o.currency}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 10,
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #eee",
                      borderRadius: 999,
                    }}
                  >
                    status: <b>{o.status}</b>
                  </span>
                  <span
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #eee",
                      borderRadius: 999,
                    }}
                  >
                    payment: <b>{o.paymentStatus}</b>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
