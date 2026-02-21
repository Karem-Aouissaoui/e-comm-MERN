import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Search, UserCheck, UserX, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

async function fetchUsers(): Promise<AdminUser[]> {
  const res = await api.get("/admin/users");
  return res.data;
}

export function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleActive(id: string, current: boolean) {
    setBusy(id);
    try {
      await api.patch(`/admin/users/${id}/${current ? "deactivate" : "activate"}`);
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(current ? "User deactivated." : "User activated.");
    } catch {
      toast.error("Action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function makeAdmin(id: string, currentRoles: string[]) {
    if (!confirm("Grant admin role to this user?")) return;
    const newRoles = Array.from(new Set([...currentRoles, "admin"]));
    setBusy(id);
    try {
      await api.patch(`/admin/users/${id}/roles`, { roles: newRoles });
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Roles updated.");
    } catch {
      toast.error("Action failed.");
    } finally {
      setBusy(null);
    }
  }

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      admin: "bg-red-600/20 text-red-400 border-red-800",
      supplier: "bg-blue-600/20 text-blue-400 border-blue-800",
      buyer: "bg-gray-700 text-gray-300 border-gray-600",
    };
    return (
      <span
        key={role}
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${map[role] ?? "bg-gray-700 text-gray-300"}`}
      >
        {role}
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <Helmet><title>Admin — Users — MME</title></Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} registered accounts</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {isLoading && <div className="flex items-center gap-3 text-gray-400"><Spinner /> Loading users…</div>}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 px-5 py-3 bg-gray-800/60 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <div className="col-span-3">Name</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Roles</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-800">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-gray-800/40 transition-colors"
            >
              <div className="md:col-span-3 text-sm font-medium text-white">{u.name}</div>
              <div className="md:col-span-4 text-sm text-gray-400 truncate">{u.email}</div>
              <div className="md:col-span-2 flex flex-wrap gap-1">
                {u.roles.map(roleBadge)}
              </div>
              <div className="md:col-span-1">
                <span className={`text-xs font-medium ${u.isActive ? "text-emerald-400" : "text-red-400"}`}>
                  {u.isActive ? "Active" : "Banned"}
                </span>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                {/* Make Admin — only if not already admin */}
                {!u.roles.includes("admin") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-gray-400 hover:text-red-400 hover:bg-red-900/20 gap-1"
                    disabled={busy === u.id}
                    onClick={() => makeAdmin(u.id, u.roles)}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-7 text-xs gap-1 ${
                    u.isActive
                      ? "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                      : "text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/20"
                  }`}
                  disabled={busy === u.id}
                  onClick={() => toggleActive(u.id, u.isActive)}
                >
                  {busy === u.id ? (
                    <Spinner className="h-3.5 w-3.5" />
                  ) : u.isActive ? (
                    <UserX className="h-3.5 w-3.5" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5" />
                  )}
                  {u.isActive ? "Ban" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
