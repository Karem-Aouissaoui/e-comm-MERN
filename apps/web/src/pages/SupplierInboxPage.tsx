import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatMoney } from "../lib/money";

/**
 * Minimal order shape for supplier inbox.
 * Add fields as you need them for UI (buyer info, items, etc.).
 */
type SupplierInboxOrder = {
  _id: string;
  status: string;
  paymentStatus: string;
  currency: string;
  totalCents: number;
  createdAt?: string;
};

export function SupplierInboxPage() {
  const [orders, setOrders] = useState<SupplierInboxOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState<string>("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      // Supplier-only endpoint we just added
      const res = await api.get("/orders/supplier/inbox");
      setOrders(res.data ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to load inbox"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function confirm(orderId: string) {
    setBusyOrderId(orderId);
    setError("");

    try {
      /**
       * Confirm order (Policy A).
       * Backend enforces: only paid orders can be confirmed.
       */
      await api.patch(`/orders/${orderId}/status`, { status: "confirmed" });

      // Reload list so confirmed orders disappear from inbox
      await load();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to confirm order"
      );
    } finally {
      setBusyOrderId("");
    }
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <h1>Supplier Inbox</h1>
      <p style={{ opacity: 0.8 }}>Paid orders waiting for your confirmation.</p>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : orders.length === 0 ? (
        <div>No paid pending orders.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((o) => (
            <div
              key={o._id}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
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
                      opacity: 0.8,
                    }}
                  >
                    {o._id}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    Total:{" "}
                    <strong>{formatMoney(o.totalCents, o.currency)}</strong>
                  </div>

                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                    Status: {o.status} | Payment: {o.paymentStatus}
                  </div>
                </div>

                <div style={{ display: "grid", alignContent: "start" }}>
                  <button
                    onClick={() => confirm(o._id)}
                    disabled={busyOrderId === o._id}
                    style={{ padding: 10, fontWeight: 700 }}
                  >
                    {busyOrderId === o._id ? "Confirming…" : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
