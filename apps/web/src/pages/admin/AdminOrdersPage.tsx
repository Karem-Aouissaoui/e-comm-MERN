import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { api } from "../../lib/api";
import { formatMoney } from "../../lib/money";
import { Badge } from "../../components/ui/badge";
import { Spinner } from "../../components/ui/spinner";
import { ChevronRight, Clock } from "lucide-react";

interface AdminOrder {
  _id: string;
  buyerId: string;
  supplierId: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
  currency: string;
  createdAt: string;
}

async function fetchOrders(): Promise<AdminOrder[]> {
  const res = await api.get("/admin/orders");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}

const paymentBadge = (s: string) => {
  if (s === "paid") return <Badge className="bg-emerald-900/40 text-emerald-400 border-emerald-800 text-xs">Paid</Badge>;
  if (s === "requires_action") return <Badge className="bg-amber-900/40 text-amber-400 border-amber-800 text-xs">Action Required</Badge>;
  if (s === "failed") return <Badge className="bg-red-900/40 text-red-400 border-red-800 text-xs">Failed</Badge>;
  return <Badge className="bg-gray-700 text-gray-400 border-gray-600 text-xs">Unpaid</Badge>;
};

const statusBadge = (s: string) => {
  if (s === "shipped") return <Badge className="bg-blue-900/40 text-blue-400 border-blue-800 text-xs">Shipped</Badge>;
  if (s === "confirmed") return <Badge className="bg-indigo-900/40 text-indigo-400 border-indigo-800 text-xs">Confirmed</Badge>;
  if (s === "cancelled") return <Badge className="bg-red-900/40 text-red-400 border-red-800 text-xs">Cancelled</Badge>;
  return <Badge className="bg-gray-700 text-gray-400 border-gray-600 text-xs">Pending</Badge>;
};

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
  });

  return (
    <div className="p-8 space-y-6">
      <Helmet><title>Admin — Orders — MME</title></Helmet>

      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {isLoading && <div className="flex items-center gap-3 text-gray-400"><Spinner /> Loading orders…</div>}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 px-5 py-3 bg-gray-800/60 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <div className="col-span-4">Order ID</div>
          <div className="col-span-2">Fulfillment</div>
          <div className="col-span-2">Payment</div>
          <div className="col-span-2">Total</div>
          <div className="col-span-2">Date</div>
        </div>

        <div className="divide-y divide-gray-800">
          {orders.map((o) => (
            <div
              key={o._id}
              onClick={() => navigate(`/orders/${o._id}`)}
              className="group grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-gray-800/40 transition-colors cursor-pointer"
            >
              <div className="md:col-span-4 flex items-center gap-2">
                <span className="font-mono text-xs text-gray-400 truncate">#{o._id}</span>
                <ChevronRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
              </div>
              <div className="md:col-span-2">{statusBadge(o.status)}</div>
              <div className="md:col-span-2">{paymentBadge(o.paymentStatus)}</div>
              <div className="md:col-span-2 text-sm font-semibold text-white">
                {formatMoney(o.totalCents, o.currency)}
              </div>
              <div className="md:col-span-2 flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                {new Date(o.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
