import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { api } from "../lib/api";
import type { Order } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import {
  MessageSquare, CreditCard, AlertCircle, CheckCircle, Clock,
  Ban, Package, ChevronRight, ShieldCheck, RefreshCw, ArrowLeft, Truck, XCircle
} from "lucide-react";
import { formatMoney } from "../lib/money";
import { cn } from "../lib/utils";
import { useMe } from "../hooks/useMe";

async function fetchOrder(id: string): Promise<Order> {
  const res = await api.get(`/orders/${id}`);
  return res.data;
}

export function OrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const { data: me } = useMe();
  const isSupplier = me?.roles.includes("supplier");
  const isBuyer = me?.roles.includes("buyer");

  const orderId = useMemo(() => id ?? "", [id]);

  const {
    data: order,
    isLoading,
    error,
    refetch,
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
      if (res.data?.threadId) {
        navigate(`/threads/${res.data.threadId}`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setActionError(t("orders.payment_required_chat"));
      } else {
        setActionError(err?.response?.data?.message ?? err?.message ?? t("orders.toast_error"));
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await api.patch(`/orders/${order._id}/status`, { status: "confirmed" });
      toast.success(t("orders.toast_confirmed"));
      await refetch();
    } catch {
      toast.error(t("orders.toast_error"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipOrder = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      await api.patch(`/orders/${order._id}/status`, { status: "shipped" });
      toast.success(t("orders.toast_shipped"));
      await refetch();
    } catch {
      toast.error(t("orders.toast_error"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm(t("orders.cancel_confirm"))) return;
    setActionLoading(true);
    try {
      await api.patch(`/orders/${order._id}/status`, { status: "cancelled" });
      toast.success(t("orders.toast_cancelled"));
      await refetch();
    } catch {
      toast.error(t("orders.toast_error"));
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (cents: number | undefined | null, currency: string) => {
    if (cents === undefined || cents === null) return "—";
    return formatMoney(cents, currency);
  };

  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return {
          color: "text-emerald-600 bg-emerald-50 border-emerald-200",
          icon: <CheckCircle className="h-5 w-5" />,
          title: t("orders.payment_success_title"),
          desc: t("orders.payment_success_desc"),
          barColor: "bg-emerald-500",
        };
      case "requires_action":
        return {
          color: "text-amber-600 bg-amber-50 border-amber-200",
          icon: <AlertCircle className="h-5 w-5" />,
          title: t("orders.payment_action_title"),
          desc: t("orders.payment_action_desc"),
          barColor: "bg-amber-500",
        };
      case "failed":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          icon: <Ban className="h-5 w-5" />,
          title: t("orders.payment_failed_title"),
          desc: t("orders.payment_failed_desc"),
          barColor: "bg-red-500",
        };
      default:
        return {
          color: "text-blue-600 bg-blue-50 border-blue-200",
          icon: <Clock className="h-5 w-5" />,
          title: t("orders.payment_pending_title"),
          desc: t("orders.payment_pending_desc"),
          barColor: "bg-blue-500",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">{t("orders.detail_loading")}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-red-50 h-24 w-24 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("orders.detail_error_title")}</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">{t("orders.detail_error_desc")}</p>
        <Button onClick={() => navigate('/orders')} variant="default" size="lg">
          {t("orders.detail_return")}
        </Button>
      </div>
    );
  }

  const paymentConfig = getPaymentStatusConfig(order.paymentStatus);

  const getNextStepsText = () => {
    if (isSupplier) {
      if (order.status === 'confirmed') return t("orders.next_steps_supplier_confirmed");
      if (order.paymentStatus === 'paid') return t("orders.next_steps_supplier_paid");
      return t("orders.next_steps_supplier_waiting");
    }
    if (order.paymentStatus === 'unpaid' || order.paymentStatus === 'requires_action')
      return t("orders.next_steps_buyer_unpaid");
    if (order.paymentStatus === 'paid')
      return t("orders.next_steps_buyer_paid");
    return t("orders.next_steps_buyer_failed");
  };

  const canBuyerCancel = isBuyer && order.status === 'pending' && order.paymentStatus !== 'paid';
  const canSupplierConfirm = isSupplier && order.status === 'pending' && order.paymentStatus === 'paid';
  const canSupplierShip = isSupplier && order.status === 'confirmed' && order.paymentStatus === 'paid';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Helmet><title>{t("orders.detail_title")} — MME</title></Helmet>

      {/* Navigation & Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden md:flex" onClick={() => navigate('/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("orders.detail_back")}
          </Button>
          <nav aria-label="Breadcrumb" className="md:hidden">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li><Link to="/orders" className="hover:text-primary transition-colors">{t("orders.detail_my_orders")}</Link></li>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li className="font-medium text-foreground truncate max-w-[200px]">#{order._id}</li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              {t("orders.detail_title")}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="font-mono bg-muted px-2 py-0.5 rounded select-all cursor-pointer hover:bg-muted/80 transition-colors">
                #{order._id}
              </span>
              <span>•</span>
              <span>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              <Badge variant="outline" className="ml-2 capitalize">
                {t("orders.status_badge")} {order.status}
              </Badge>
            </div>
          </div>

          <div className={cn("flex flex-col items-end px-5 py-3 rounded-xl border-l-4 shadow-sm bg-white", paymentConfig.color.replace('text-', 'border-l-'))}>
            <div className="flex items-center gap-2 font-bold text-lg mb-1">
              {paymentConfig.icon}
              <span className="capitalize">{paymentConfig.title}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{paymentConfig.desc}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Items & Summary */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="overflow-hidden border-none ring-1 ring-black/5 shadow-md">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5 text-primary" />
                {t("orders.items_ordered")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-6 hover:bg-muted/5 transition-colors group">
                    <div className="h-24 w-24 shrink-0 rounded-lg bg-gray-100 overflow-hidden border shadow-sm group-hover:scale-105 transition-transform duration-300">
                      {item.product?.imageUrls?.[0] ? (
                        <img src={item.product.imageUrls[0]} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                          <Package className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.title || "Product Unavailable"}</h3>
                        {item.product?.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.product.description}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="px-2 font-normal">
                          {t("orders.qty")} {item.quantity}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatPrice(item.unitPriceCents * item.quantity, order.currency)}
                          </div>
                          {item.quantity > 1 && (
                            <span className="text-xs text-muted-foreground block">
                              {formatPrice(item.unitPriceCents, order.currency)} {t("orders.each")}
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

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-full md:w-80 bg-slate-900 text-white rounded-xl p-6 shadow-xl">
              <div className="space-y-3">
                <div className="flex justify-between text-slate-300">
                  <span>{t("orders.subtotal")}</span>
                  <span>{formatPrice(order.totalCents, order.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{t("orders.tax_fees")}</span>
                  <span>$0.00</span>
                </div>
                <div className="h-px bg-slate-700 my-2" />
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-lg">{t("orders.total")}</span>
                  <span className="text-3xl font-bold tracking-tight">{formatPrice(order.totalCents, order.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-4 space-y-6">
          <Card className={cn("border-l-4 shadow-lg overflow-hidden", paymentConfig.color.replace('text-', 'border-l-'))}>
            <div className={cn("h-2 w-full", paymentConfig.barColor)} />
            <CardHeader>
              <CardTitle className="text-lg">{t("orders.next_steps")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{getNextStepsText()}</p>

              {/* Buyer: checkout */}
              {isBuyer && (order.paymentStatus === 'unpaid' || order.paymentStatus === 'requires_action') && (
                <Button className="w-full h-12 text-base font-semibold shadow-md" size="lg" onClick={() => navigate(`/checkout/${order._id}`)}>
                  <CreditCard className="mr-2 h-5 w-5" />
                  {t("orders.secure_checkout")}
                </Button>
              )}

              {/* Buyer: retry payment */}
              {isBuyer && order.paymentStatus === 'failed' && (
                <Button className="w-full h-12 text-base font-semibold shadow-md bg-red-600 hover:bg-red-700" size="lg" onClick={() => navigate(`/checkout/${order._id}`)}>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  {t("orders.retry_payment")}
                </Button>
              )}

              {/* Supplier: confirm order */}
              {canSupplierConfirm && (
                <Button
                  className="w-full h-12 text-base font-semibold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                  onClick={handleConfirmOrder}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Spinner size="sm" className="mr-2" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                  {t("orders.confirm_order")}
                </Button>
              )}

              {/* Supplier: mark as shipped */}
              {canSupplierShip && (
                <Button
                  className="w-full h-12 text-base font-semibold shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  onClick={handleShipOrder}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Spinner size="sm" className="mr-2" /> : <Truck className="mr-2 h-5 w-5" />}
                  {t("orders.ship_order")}
                </Button>
              )}

              {/* Chat (paid orders) */}
              {order.paymentStatus === 'paid' && (
                <Button
                  className="w-full h-12 text-base font-semibold shadow-md bg-white text-gray-900 border hover:bg-gray-50"
                  size="lg"
                  onClick={handleMessageSupplier}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Spinner size="sm" className="mr-2" /> : <MessageSquare className="mr-2 h-5 w-5" />}
                  {isSupplier ? t("orders.chat_buyer") : t("orders.chat_supplier")}
                </Button>
              )}

              {/* Buyer: cancel order */}
              {canBuyerCancel && (
                <Button
                  className="w-full h-11 text-sm font-semibold bg-white text-red-600 border border-red-200 hover:bg-red-50"
                  size="lg"
                  onClick={handleCancelOrder}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Spinner size="sm" className="mr-2" /> : <XCircle className="mr-2 h-4 w-4" />}
                  {t("orders.cancel_order")}
                </Button>
              )}

              {actionError && (
                <div className="p-3 rounded-md bg-red-50 text-red-600 text-xs border border-red-100">
                  {actionError}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>{t("orders.secure_transaction")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">{t("orders.about_order")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p className="text-muted-foreground">{t("orders.about_desc")}</p>
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-1">{t("orders.buyer_protection")}</h4>
                <p className="text-blue-700 text-xs leading-relaxed">{t("orders.buyer_protection_desc")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
