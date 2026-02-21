import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import { formatMoney } from "../lib/money";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Spinner } from "../components/ui/spinner";
import { EmptyState } from "../components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import type { Product } from "../types";
import {
  Package,
  Plus,
  Pencil,
  Archive,
  PackageOpen,
  TrendingUp,
} from "lucide-react";

async function fetchMyProducts(): Promise<Product[]> {
  const res = await api.get("/products/mine");
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  return [];
}

function StatusBadge({ status }: { status?: string }) {
  const { t } = useTranslation();
  switch (status) {
    case "published":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
          {t("supplier.dashboard.status_published")}
        </Badge>
      );
    case "archived":
      return (
        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200">
          {t("supplier.dashboard.status_archived")}
        </Badge>
      );
    default:
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
          {t("supplier.dashboard.status_draft")}
        </Badge>
      );
  }
}

export function SupplierDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [archiving, setArchiving] = useState<string | null>(null);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["my-products"],
    queryFn: fetchMyProducts,
  });

  const publishedCount = products?.filter((p) => p.status === "published").length ?? 0;
  const archivedCount = products?.filter((p) => p.status === "archived").length ?? 0;
  const totalCount = products?.length ?? 0;

  async function handleArchive(productId: string) {
    if (!window.confirm(t("supplier.dashboard.archive_confirm"))) return;
    setArchiving(productId);
    try {
      await api.delete(`/products/${productId}`);
      await queryClient.invalidateQueries({ queryKey: ["my-products"] });
    } finally {
      setArchiving(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">{t("common.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-12 px-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {t("common.error")}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t("supplier.dashboard.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("supplier.dashboard.subtitle")}</p>
        </div>
        <Button asChild className="rounded-full gap-2">
          <Link to="/supplier/products/new">
            <Plus className="h-4 w-4" />
            {t("supplier.dashboard.add_product")}
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("supplier.dashboard.stat_total")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("supplier.dashboard.stat_published")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("supplier.dashboard.stat_archived")}
            </CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-500">{archivedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      {(!products || products.length === 0) ? (
        <EmptyState
          icon={PackageOpen}
          title={t("supplier.dashboard.empty_title")}
          description={t("supplier.dashboard.empty_desc")}
          action={
            <Button onClick={() => navigate("/supplier/products/new")}>
              <Plus className="mr-2 h-4 w-4" />
              {t("supplier.dashboard.add_product")}
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <div className="col-span-5">{t("supplier.dashboard.col_product")}</div>
            <div className="col-span-2">{t("supplier.dashboard.col_category")}</div>
            <div className="col-span-2">{t("supplier.dashboard.col_price")}</div>
            <div className="col-span-1">{t("supplier.dashboard.col_status")}</div>
            <div className="col-span-2 text-right">{t("supplier.dashboard.col_actions")}</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div
                key={product._id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/60 transition-colors"
              >
                {/* Product name + thumbnail */}
                <div className="md:col-span-5 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-gray-100 border flex-shrink-0 overflow-hidden">
                    {product.imageUrls?.[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{product.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="md:col-span-2">
                  {product.category ? (
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>

                {/* Price */}
                <div className="md:col-span-2 font-semibold text-gray-800">
                  {formatMoney(product.priceCents, product.currency)}
                </div>

                {/* Status */}
                <div className="md:col-span-1">
                  <StatusBadge status={product.status} />
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => navigate(`/supplier/products/${product._id}/edit`)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("supplier.dashboard.edit")}
                  </Button>
                  {product.status !== "archived" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50"
                      disabled={archiving === product._id}
                      onClick={() => handleArchive(product._id)}
                    >
                      {archiving === product._id ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                      {t("supplier.dashboard.archive")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
