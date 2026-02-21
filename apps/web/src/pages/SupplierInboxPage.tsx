import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../lib/api";
import { formatMoney } from "../lib/money";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import { 
  Inbox, 
  PackageCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  ChevronRight, 
  ShoppingBag,
  User
} from "lucide-react";
import { EmptyState } from "../components/ui/empty-state";
import { cn } from "../lib/utils";
import type { Order } from "../types";

// Helper for fetching all supplier orders
async function fetchSupplierOrders(): Promise<Order[]> {
  const res = await api.get("/orders/supplier");
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  return [];
}

export function SupplierInboxPage() {
  const navigate = useNavigate();
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["supplier-orders"],
    queryFn: fetchSupplierOrders,
  });

  const handleConfirm = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setActionBusy(orderId);
    setActionError(null);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: "confirmed" });
      await refetch();
    } catch (err: any) {
       // Silent fail or toast could be better, but inline error for now
       console.error("Failed to confirm", err);
    } finally {
      setActionBusy(null);
    }
  };

  const handleMessageBuyer = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setActionBusy(orderId);
    setActionError(null);
    try {
      const res = await api.get(`/orders/${orderId}/thread`);
      if (res.data && res.data.threadId) {
          navigate(`/threads/${res.data.threadId}`);
      }
    } catch (err: any) {
        if (err?.response?.status === 403) {
             setActionError("Payment required to message buyer.");
             // Auto-clear after 3s
             setTimeout(() => setActionError(null), 3000);
        } else {
             console.error("Failed to open thread", err);
        }
    } finally {
      setActionBusy(null);
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Paid</Badge>;
      case "requires_action":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Action Required</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Failed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">Pending</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case "shipped":
            return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Shipped</Badge>;
        case "confirmed":
            return <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">Confirmed</Badge>;
        case "cancelled":
            return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Cancelled</Badge>;
        default:
            return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-12 px-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
             <AlertCircle className="h-5 w-5" />
             <p>Failed to load inbox. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
     return (
        <div className="max-w-5xl mx-auto mt-12 px-4">
           <EmptyState
              icon={PackageCheck}
              title="All caught up!"
              description="No orders have been assigned to you yet."
           />
        </div>
     );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Inbox className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Supplier Inbox</h1>
                <p className="text-muted-foreground mt-1">
                    Orders awaiting action or communication
                </p>
            </div>
        </div>
      </div>

      {actionError && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {actionError}
            </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
            <div 
                key={order._id} 
                onClick={() => navigate(`/orders/${order._id}`)}
                className="group relative bg-white border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
            >
                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* ID, Date (4 cols) */}
                    <div className="md:col-span-4 space-y-1">
                        <div className="flex items-center gap-2">
                             <span className="font-mono font-medium text-gray-900">#{order._id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Buyer
                            </span>
                        </div>
                    </div>

                    {/* Statuses & Total (4 cols) */}
                    <div className="md:col-span-4 flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                             {getStatusBadge(order.status)}
                             {getPaymentBadge(order.paymentStatus)}
                         </div>
                         <div className="flex items-center gap-2 font-medium text-gray-900">
                             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                             {formatMoney(order.totalCents, order.currency)}
                         </div>
                    </div>

                    {/* Actions (4 cols) */}
                    <div className="md:col-span-4 flex items-center justify-end gap-2">
                        {/* Confirm Button (Only if pending & paid) */}
                        {order.status === 'pending' && order.paymentStatus === 'paid' && (
                             <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={(e) => handleConfirm(e, order._id)}
                                disabled={!!actionBusy}
                             >
                                 {actionBusy === order._id ? <Spinner size="sm" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                 Confirm
                             </Button>
                        )}

                        {/* Message Button (Only if paid) */}
                        {order.paymentStatus === 'paid' && (
                             <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => handleMessageBuyer(e, order._id)}
                                disabled={!!actionBusy}
                             >
                                 <MessageSquare className="h-4 w-4 mr-1" />
                                 Chat
                             </Button>
                        )}
                         
                         <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground group-hover:text-primary">
                            <ChevronRight className="h-5 w-5" />
                         </Button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
