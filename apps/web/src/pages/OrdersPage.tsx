import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { Helmet } from "react-helmet-async";
import { Package, ChevronRight, Clock, AlertCircle, ShoppingBag } from "lucide-react";
import { formatMoney } from "../lib/money";
import { EmptyState } from "../components/ui/empty-state";
import type { Order } from "../types";

async function fetchOrders(): Promise<Order[]> {
  const res = await api.get("/orders/buyer");
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  return [];
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["buyer-orders"],
    queryFn: fetchOrders,
  });

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">{t("orders.payment_paid")}</Badge>;
      case "requires_action":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">{t("orders.payment_action")}</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">{t("orders.payment_failed")}</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200">{t("orders.payment_pending")}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shipped":
        return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">{t("orders.status_shipped")}</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">{t("orders.status_confirmed")}</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">{t("orders.status_cancelled")}</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">{t("orders.status_pending")}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">{t("orders.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <p>{t("orders.error")}</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <Helmet><title>{t("orders.page_title")} — MME</title></Helmet>
        <EmptyState
          icon={ShoppingBag}
          title={t("orders.empty_title")}
          description={t("orders.empty_desc")}
          action={
            <Button onClick={() => navigate('/products')}>
              {t("orders.browse_products")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 py-8 px-4">
      <Helmet><title>{t("orders.page_title")} — MME</title></Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t("orders.page_title")}</h1>
          <p className="text-muted-foreground mt-1">{t("orders.page_subtitle")}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/products">
            <Package className="mr-2 h-4 w-4" />
            {t("orders.browse_products")}
          </Link>
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            onClick={() => navigate(`/orders/${order._id}`)}
            className="group relative bg-white border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* ID & Date */}
              <div className="md:col-span-4 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-gray-900">#{order._id}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </div>
              </div>

              {/* Status & Total */}
              <div className="md:col-span-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium mb-1">{t("orders.col_status")}</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium mb-1">{t("orders.col_payment")}</span>
                  {getPaymentBadge(order.paymentStatus)}
                </div>
                <div className="flex flex-col md:ml-auto md:text-right">
                  <span className="text-xs text-muted-foreground font-medium mb-1">{t("orders.col_total")}</span>
                  <span className="font-bold text-gray-900">{formatMoney(order.totalCents, order.currency)}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="md:col-span-3 flex justify-end items-center">
                <span className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                  {t("orders.view_details")}
                </span>
                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
