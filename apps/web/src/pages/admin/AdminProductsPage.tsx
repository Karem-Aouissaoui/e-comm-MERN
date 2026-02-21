import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { api } from "../../lib/api";
import { formatMoney } from "../../lib/money";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Search, Archive, Package } from "lucide-react";
import { toast } from "sonner";

interface AdminProduct {
  _id: string;
  title: string;
  category?: string;
  priceCents: number;
  currency: string;
  status?: string;
  supplierId?: string;
  imageUrls?: string[];
}

async function fetchProducts(): Promise<AdminProduct[]> {
  const res = await api.get("/admin/products");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}

export function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchProducts,
  });

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleArchive(id: string) {
    if (!confirm("Archive this product? It will no longer be visible to buyers.")) return;
    setBusy(id);
    try {
      await api.delete(`/admin/products/${id}`);
      await qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product archived.");
    } catch {
      toast.error("Failed to archive product.");
    } finally {
      setBusy(null);
    }
  }

  const statusBadge = (status?: string) => {
    if (status === "published")
      return <Badge className="bg-emerald-900/40 text-emerald-400 border-emerald-800 text-xs">Published</Badge>;
    if (status === "archived")
      return <Badge className="bg-gray-700 text-gray-400 border-gray-600 text-xs">Archived</Badge>;
    return <Badge className="bg-amber-900/40 text-amber-400 border-amber-800 text-xs">Draft</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      <Helmet><title>Admin — Products — MME</title></Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} total products</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or category…"
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {isLoading && <div className="flex items-center gap-3 text-gray-400"><Spinner /> Loading products…</div>}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 px-5 py-3 bg-gray-800/60 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <div className="col-span-5">Product</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-800">
          {filtered.map((p) => (
            <div key={p._id} className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-gray-800/40 transition-colors">
              <div className="md:col-span-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-800 border border-gray-700 flex-shrink-0 overflow-hidden">
                  {p.imageUrls?.[0] ? (
                    <img src={p.imageUrls[0]} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-white truncate">{p.title}</span>
              </div>
              <div className="md:col-span-2 text-sm text-gray-400">{p.category ?? "—"}</div>
              <div className="md:col-span-2 text-sm font-semibold text-white">
                {formatMoney(p.priceCents, p.currency)}
              </div>
              <div className="md:col-span-1">{statusBadge(p.status)}</div>
              <div className="md:col-span-2 flex justify-end">
                {p.status !== "archived" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy === p._id}
                    onClick={() => handleArchive(p._id)}
                    className="h-7 text-xs gap-1 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                  >
                    {busy === p._id ? <Spinner className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                    Archive
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
