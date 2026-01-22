import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Order } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import { 
  MessageSquare, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Ban, 
  Package, 
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { formatMoney } from "../lib/money";
import { cn } from "../lib/utils";

async function fetchOrder(id: string): Promise<Order> {
  const res = await api.get(`/orders/${id}`);
  return res.data;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const orderId = useMemo(() => id ?? "", [id]);

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: !!orderId,
    retry: false,
  });

  const handleMessageSupplier = async () => {
    if (!order) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.get(`/orders/${order._id}/thread`);
      // Strict expectation: { threadId: string }
      if (res.data && res.data.threadId) {
          navigate(`/threads/${res.data.threadId}`);
      } else {
         throw new Error("Invalid response from server");
      }
    } catch (err: any) {
        setActionError(err?.response?.data?.message ?? err?.message ?? "Failed to open thread. Please try again later.");
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to respect "—" requirement for missing prices
  const formatPrice = (cents: number | undefined | null, currency: string) => {
      if (cents === undefined || cents === null) return "—";
      return formatMoney(cents, currency);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid": 
        return {
          color: "text-emerald-600 bg-emerald-50 border-emerald-200",
          icon: <CheckCircle className="h-5 w-5" />,
          title: "Payment Successful",
          desc: "Your order is confirmed and payment has been processed.",
          barColor: "bg-emerald-500"
        };
      case "requires_action": 
        return {
          color: "text-amber-600 bg-amber-50 border-amber-200",
          icon: <AlertCircle className="h-5 w-5" />,
          title: "Action Required",
          desc: "Please authenticate your payment to proceed.",
          barColor: "bg-amber-500"
        };
      case "failed": 
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          icon: <Ban className="h-5 w-5" />,
          title: "Payment Failed",
          desc: "We couldn't process your payment. Please try again.",
          barColor: "bg-red-500"
        };
      default: 
        return {
          color: "text-blue-600 bg-blue-50 border-blue-200",
          icon: <Clock className="h-5 w-5" />,
          title: "Payment Pending",
          desc: "Waiting for payment confirmation.",
          barColor: "bg-blue-500"
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
         <div className="bg-red-50 h-24 w-24 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
            <AlertCircle className="h-10 w-10 text-red-500" />
         </div>
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
         <p className="text-gray-500 mb-8 text-center max-w-md">
           We couldn't locate this order. It may have been removed or you may not have permission to view it.
         </p>
         <Button onClick={() => navigate('/orders')} variant="default" size="lg">
            Return to My Orders
         </Button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.paymentStatus);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Navigation & Header */}
      <div className="space-y-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li><Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="font-medium text-foreground truncate max-w-[200px]">#{order._id}</li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b pb-8">
             <div className="space-y-2">
                 <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                    Order Details
                 </h1>
                 <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-mono bg-muted px-2 py-0.5 rounded">#{order._id}</span>
                    <span>•</span>
                    <span>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                 </div>
             </div>
             
             {/* Status Badge - Large */}
             <div className={cn("flex flex-col items-end px-5 py-3 rounded-xl border-l-4 shadow-sm bg-white", statusConfig.color.replace('text-', 'border-l-'))}>
                <div className="flex items-center gap-2 font-bold text-lg mb-1">
                    {statusConfig.icon}
                    <span className="capitalize">{order.paymentStatus.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">{statusConfig.desc}</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Order Items & Summary (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
            <Card className="overflow-hidden border-none ring-1 ring-black/5 shadow-md">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Package className="h-5 w-5 text-primary" />
                        Items Ordered
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex gap-4 p-6 hover:bg-muted/5 transition-colors group">
                                 <div className="h-24 w-24 shrink-0 rounded-lg bg-gray-100 overflow-hidden border shadow-sm group-hover:scale-105 transition-transform duration-300">
                                    {item.product?.imageUrls?.[0] ? (
                                         <img 
                                            src={item.product.imageUrls[0]} 
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                         />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                                            <Package className="h-10 w-10" />
                                        </div>
                                    )}
                                 </div>
                                 <div className="flex-1 flex flex-col justify-between py-1">
                                     <div>
                                         <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                             {item.title || "Product Unavailable"}
                                         </h3>
                                         {item.product?.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {item.product.description}
                                            </p>
                                         )}
                                     </div>
                                     <div className="flex items-center justify-between mt-2">
                                         <Badge variant="secondary" className="px-2 font-normal">
                                            Qty: {item.quantity}
                                         </Badge>
                                         <div className="text-right">
                                             <div className="text-lg font-bold">
                                                {formatPrice(item.unitPriceCents * item.quantity, order.currency)}
                                             </div>
                                             {item.quantity > 1 && (
                                                 <span className="text-xs text-muted-foreground block">
                                                     {formatPrice(item.unitPriceCents, order.currency)} each
                                                 </span>
                                             )}
                                         </div>
                                     </div>
                                 </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Total Section */}
            <div className="flex justify-end">
                <div className="w-full md:w-80 bg-slate-900 text-white rounded-xl p-6 shadow-xl">
                    <div className="space-y-3">
                        <div className="flex justify-between text-slate-300">
                            <span>Subtotal</span>
                            {/* Prefer order.totalCents if available, assuming subtotal matches for now or we just hide breakdown */}
                            <span>{formatPrice(order.totalCents, order.currency)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                            <span>Tax / Fees</span>
                            <span>$0.00</span> 
                        </div>
                        <div className="h-px bg-slate-700 my-2"></div>
                        <div className="flex justify-between items-baseline">
                            <span className="font-medium text-lg">Total</span>
                            <span className="text-3xl font-bold tracking-tight">{formatPrice(order.totalCents, order.currency)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Actions & Support (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
             
             {/* Primary Action Card */}
            <Card className={cn("border-l-4 shadow-lg overflow-hidden", statusConfig.color.replace('text-', 'border-l-'))}>
                <div className={cn("h-2 w-full", statusConfig.barColor)} />
                <CardHeader>
                    <CardTitle className="text-lg">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {order.paymentStatus === 'unpaid' || order.paymentStatus === 'requires_action' 
                            ? "Provide payment details to secure your order. Shipping initiates once payment is verified."
                            : order.paymentStatus === 'paid'
                            ? "Your order is fully paid. You can now coordinate shipping details directly with the supplier."
                            : "There was an issue with the payment method provided."}
                    </p>

                    {order.paymentStatus === 'unpaid' || order.paymentStatus === 'requires_action' ? (
                        <Button className="w-full h-12 text-base font-semibold shadow-md transition-all hover:-translate-y-0.5" size="lg" onClick={() => navigate(`/checkout/${order._id}`)}>
                            <CreditCard className="mr-2 h-5 w-5" />
                            Secure Checkout
                        </Button>
                    ) : order.paymentStatus === 'paid' ? (
                        <>
                            <Button 
                                className="w-full h-12 text-base font-semibold shadow-md bg-white text-gray-900 border hover:bg-gray-50 transition-all hover:-translate-y-0.5" 
                                size="lg" 
                                onClick={handleMessageSupplier}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Spinner size="sm" className="mr-2" /> : <MessageSquare className="mr-2 h-5 w-5" />}
                                Chat with Supplier
                            </Button>
                             {actionError && (
                                <div className="p-3 rounded-md bg-red-50 text-red-600 text-xs border border-red-100 animate-pulse">
                                    {actionError}
                                </div>
                             )}
                        </>
                    ) : order.paymentStatus === 'failed' ? (
                        <Button className="w-full h-12 text-base font-semibold shadow-md bg-red-600 hover:bg-red-700 transition-all hover:-translate-y-0.5" size="lg" onClick={() => navigate(`/checkout/${order._id}`)}>
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Retry Payment
                        </Button>
                    ) : null}
                    
                    <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span>Secure encrypted transaction</span>
                    </div>
                </CardContent>
            </Card>

             {/* Support Card */}
             <Card>
                 <CardHeader>
                     <CardTitle className="text-base text-muted-foreground">About this Order</CardTitle>
                 </CardHeader>
                 <CardContent className="text-sm space-y-4">
                     <p className="text-muted-foreground">
                         If you have specific requirements or shipping questions, please use the chat feature to communicate directly with the supplier.
                     </p>
                     <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                         <h4 className="font-semibold text-blue-900 mb-1">Buyer Protection</h4>
                         <p className="text-blue-700 text-xs leading-relaxed">
                             Payments are held securely until the order is fulfilled. Contact support if you experience any issues.
                         </p>
                     </div>
                 </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
