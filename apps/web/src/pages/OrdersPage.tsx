import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { ArrowLeft, CreditCard, Package } from "lucide-react";
import { formatMoney } from "../lib/money";
import { EmptyState } from "../components/ui/empty-state";

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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
             to="/products"
             className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
           >
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back to shopping
           </Link>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
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
            icon={Package}
            title="No orders yet"
            description="You haven't placed any orders yet. Start shopping to see them here!"
            action={
               <Link to="/products">
                 <Button>Browse Products</Button>
               </Link>
            }
         />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o._id} to={`/orders/${o._id}`}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium">
                      Order <span className="font-mono text-muted-foreground">#{o._id.slice(-6)}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <div className="font-bold text-lg">
                    {formatMoney(o.totalCents, o.currency)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      Status: 
                      <Badge variant={o.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                         {o.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      Payment:
                      <Badge variant={o.paymentStatus === 'paid' ? 'default' : 'outline'} className="capitalize">
                        {o.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
