import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatMoney } from "../lib/money";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import { Check, Inbox, PackageCheck } from "lucide-react";
import { EmptyState } from "../components/ui/empty-state";

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
      await api.patch(`/orders/${orderId}/status`, { status: "confirmed" });
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
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
         <Inbox className="h-8 w-8 text-primary" />
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Supplier Inbox</h1>
            <p className="text-muted-foreground">Manage paid orders waiting for confirmation.</p>
         </div>
      </div>

      {error && (
         <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-destructive text-center">
            {error}
         </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
         <EmptyState
            icon={PackageCheck}
            title="All caught up!"
            description="No new paid orders to confirm at the moment."
         />
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <Card key={o._id} className="overflow-hidden">
               <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2">
                        <span className="font-mono text-sm px-2 py-1 bg-muted rounded">#{o._id.slice(-6)}</span>
                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                           Paid
                        </Badge>
                     </div>
                     <div className="text-sm text-muted-foreground">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : "Unknown Date"}
                     </div>
                  </div>

                  <div className="flex items-center gap-8">
                     <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Value</div>
                        <div className="text-xl font-bold text-foreground">
                           {formatMoney(o.totalCents, o.currency)}
                        </div>
                     </div>
                     
                     <Button 
                        onClick={() => confirm(o._id)}
                        disabled={busyOrderId === o._id}
                        size="lg"
                     >
                        {busyOrderId === o._id ? (
                           <Spinner className="h-4 w-4 bg-primary-foreground" />
                        ) : (
                           <>
                              <Check className="mr-2 h-4 w-4" />
                              Confirm Order
                           </>
                        )}
                     </Button>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
