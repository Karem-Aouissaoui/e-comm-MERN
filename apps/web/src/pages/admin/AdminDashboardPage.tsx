import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { api } from "../../lib/api";
import { formatMoney } from "../../lib/money";
import { Spinner } from "../../components/ui/spinner";
import { Users, Package, ShoppingBag, TrendingUp } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalSuppliers: number;
  totalBuyers: number;
  totalProducts: number;
  publishedProducts: number;
  archivedProducts: number;
  totalOrders: number;
  totalRevenueCents: number;
}

async function fetchStats(): Promise<Stats> {
  const res = await api.get("/admin/stats");
  return res.data;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subLabel,
  subValue,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  subLabel?: string;
  subValue?: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subLabel && (
          <p className="text-xs text-gray-500 mt-1">
            {subLabel}: <span className="text-gray-300">{subValue}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchStats,
  });

  return (
    <div className="p-8 space-y-8">
      <Helmet><title>Admin Dashboard — MME</title></Helmet>

      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Platform-wide overview</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 text-gray-400">
          <Spinner /> Loading stats...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
          Failed to load stats. Please refresh.
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={data.totalUsers}
            subLabel="Suppliers / Buyers"
            subValue={`${data.totalSuppliers} / ${data.totalBuyers}`}
            color="bg-blue-600/20 text-blue-400"
          />
          <StatCard
            icon={Package}
            label="Products"
            value={data.totalProducts}
            subLabel="Published"
            subValue={data.publishedProducts}
            color="bg-emerald-600/20 text-emerald-400"
          />
          <StatCard
            icon={ShoppingBag}
            label="Orders"
            value={data.totalOrders}
            color="bg-amber-600/20 text-amber-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Revenue"
            value={formatMoney(data.totalRevenueCents, "USD")}
            subLabel="Paid orders only"
            color="bg-purple-600/20 text-purple-400"
          />
        </div>
      )}
    </div>
  );
}
