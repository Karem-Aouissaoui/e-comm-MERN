import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "../hooks/useMe";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import { Menu, X } from "lucide-react";

function NavItem(props: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={props.to}
      onClick={props.onClick}
      className={({ isActive }) =>
        cn(
          "px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-50 text-blue-700 font-semibold"
            : "text-muted-foreground hover:bg-blue-50 hover:text-blue-600"
        )
      }
    >
      {props.label}
    </NavLink>
  );
}

export function AppShell() {
  const { t, i18n } = useTranslation();
  const { data: me } = useMe();
  const roles = me?.roles ?? [];
  const location = useLocation();

  const isBuyer = roles.includes("buyer");
  const isSupplier = roles.includes("supplier");
  const isAdmin = roles.includes("admin");

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = (
    <>
      <NavItem to="/products" label={t("nav.products")} onClick={() => setMobileOpen(false)} />
      {isBuyer && <NavItem to="/orders" label={t("nav.orders")} onClick={() => setMobileOpen(false)} />}
      {isSupplier && <NavItem to="/supplier/inbox" label={t("nav.inbox")} onClick={() => setMobileOpen(false)} />}
      {isSupplier && <NavItem to="/supplier/dashboard" label={t("supplier.nav_my_products")} onClick={() => setMobileOpen(false)} />}
      {me && <NavItem to="/messages" label={t("nav.messages")} onClick={() => setMobileOpen(false)} />}
      <NavItem to="/about" label={t("nav.about")} onClick={() => setMobileOpen(false)} />
      <NavItem to="/contact" label={t("nav.contact")} onClick={() => setMobileOpen(false)} />
      {isAdmin && <NavItem to="/admin" label={t("nav.admin")} onClick={() => setMobileOpen(false)} />}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-[0_4px_24px_rgba(37,99,235,0.08)]">
        <div className="container mx-auto max-w-7xl px-4 md:px-6 flex h-16 md:h-20 items-center justify-between">
          {/* Logo + Desktop Nav */}
          <div className="flex items-center gap-8 lg:gap-12">
            <Link
              to="/products"
              className="text-xl font-bold tracking-tight text-primary-900 flex items-center gap-2 transition-transform hover:scale-105"
            >
              <img src="/logo.png" className="h-10 md:h-14 w-auto object-contain drop-shadow-sm" alt="MME" />
              <span className="hidden md:block text-[#2563eb] text-3xl font-extrabold tracking-tighter">MME</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks}
            </nav>
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Language Switcher */}
            <div className="hidden lg:flex items-center bg-[#f1f5f9] rounded-full px-3 py-1 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="none" />
                <path d="M2 12h20M12 2c2.5 3.5 2.5 16.5 0 20M12 2c-2.5 3.5-2.5 16.5 0 20M12 2c-2.5 3.5-2.5 16.5 0 20" stroke="#2563eb" strokeWidth="1.5" fill="none" />
              </svg>
              <select
                className="bg-transparent border-none text-[#2563eb] font-semibold focus:ring-0 py-0 pl-2 pr-6 text-sm cursor-pointer outline-none"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
                <option value="de">Deutsch</option>
                <option value="tr">Türkçe</option>
                <option value="fr">Français</option>
                <option value="nl">Nederlands</option>
              </select>
            </div>

            {/* User info — hidden on very small screens */}
            {me ? (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">{me.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{roles.join(", ")}</p>
                </div>
                <Link to="/profile" title="My Profile" className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm hover:bg-primary/10 transition-colors ring-0 hover:ring-2 hover:ring-primary/30">
                  {(me.email || "U").charAt(0).toUpperCase()}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={async () => {
                    await api.post("/auth/logout");
                    window.location.href = "/login";
                  }}
                >
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm" className="rounded-full">
                  {t("nav.login")}
                </Button>
              </Link>
            )}

            {/* Hamburger button — mobile only */}
            <button
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav panel — slides in below header */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100",
            mobileOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 py-3 bg-white flex flex-col gap-1">
            {navLinks}

            {/* Language switcher in mobile drawer */}
            <div className="flex items-center gap-2 px-3 py-2 mt-2 border-t border-gray-100 pt-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="none" />
                <path d="M2 12h20M12 2c2.5 3.5 2.5 16.5 0 20M12 2c-2.5 3.5-2.5 16.5 0 20" stroke="#2563eb" strokeWidth="1.5" fill="none" />
              </svg>
              <select
                className="bg-transparent border-none text-[#2563eb] font-semibold focus:ring-0 text-sm cursor-pointer outline-none flex-1"
                value={i18n.language}
                onChange={(e) => { i18n.changeLanguage(e.target.value); setMobileOpen(false); }}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
                <option value="de">Deutsch</option>
                <option value="tr">Türkçe</option>
                <option value="fr">Français</option>
                <option value="nl">Nederlands</option>
              </select>
            </div>

            {/* Logout in mobile drawer */}
            {me && (
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left mt-1"
                onClick={async () => {
                  await api.post("/auth/logout");
                  window.location.href = "/login";
                }}
              >
                {t("nav.logout")}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8 min-h-[calc(100vh-160px)]">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-gray-100 bg-white py-8 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link to="/terms" className="hover:text-[#2563eb] transition-colors">{t("footer.terms")}</Link>
            <span>&middot;</span>
            <Link to="/privacy" className="hover:text-[#2563eb] transition-colors">{t("footer.privacy")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
