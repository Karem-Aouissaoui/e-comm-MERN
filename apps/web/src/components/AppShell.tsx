import { Link, NavLink, Outlet } from "react-router-dom";
import { useMe } from "../hooks/useMe";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

function NavItem(props: { to: string; label: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          "px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )
      }
    >
      {props.label}
    </NavLink>
  );
}

export function AppShell() {
  const { data: me } = useMe();
  const roles = me?.roles ?? [];

  const isBuyer = roles.includes("buyer");
  const isSupplier = roles.includes("supplier");
  const isAdmin = roles.includes("admin");

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/products"
              className="text-xl font-bold tracking-tight text-primary-900 flex items-center gap-2"
            >
              <div className="h-6 w-6 rounded-full bg-primary-600" />
              e-comm
            </Link>

            <nav className="flex items-center gap-1">
              <NavItem to="/products" label="Products" />
              {isBuyer && <NavItem to="/orders" label="My Orders" />}
              {isSupplier && <NavItem to="/supplier/inbox" label="Inbox" />}
              <NavItem to="/messages" label="Messages" />
              {isAdmin && <NavItem to="/admin" label="Admin" />}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {me ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">{me.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {roles.join(", ")}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary-100 border border-primary-200" />
              </div>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
