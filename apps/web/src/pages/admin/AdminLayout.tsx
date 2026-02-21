import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMe } from "../../hooks/useMe";
import { ShieldCheck, Users, Package, ShoppingBag, LayoutDashboard, LogOut } from "lucide-react";
import { api } from "../../lib/api";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users",     label: "Users",     icon: Users },
  { to: "/admin/products",  label: "Products",  icon: Package },
  { to: "/admin/orders",    label: "Orders",    icon: ShoppingBag },
];

export function AdminLayout() {
  const { data: user } = useMe();
  const navigate = useNavigate();

  async function handleLogout() {
    await api.post("/auth/logout");
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
          <div className="p-1.5 bg-red-600/20 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-white">Admin Panel</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-600/20 text-red-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-950">
        <Outlet />
      </main>
    </div>
  );
}
