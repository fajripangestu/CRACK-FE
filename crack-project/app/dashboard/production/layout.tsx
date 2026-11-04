"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightOnRectangleIcon,
  ClipboardDocumentCheckIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const PRODUCTION_HREF = "/dashboard/production";
const menuItems = [
  { label: "Beranda", href: PRODUCTION_HREF, icon: Squares2X2Icon },
  {
    label: "Persetujuan Customer Order",
    href: `${PRODUCTION_HREF}/persetujuan-order`,
    icon: ClipboardDocumentCheckIcon,
  },
];

export default function ProductionDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function handleLogout() {
    document.cookie = "token=; Path=/; Max-Age=0";
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur lg:px-6">
        <Link href={PRODUCTION_HREF} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-semibold text-white shadow-md">
            M
          </span>
          <span>
            <span className="block font-semibold leading-tight text-text">Manutics</span>
            <span className="block text-xs text-slate-500">Dashboard Produksi</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-slate-700 transition hover:bg-primary/10 hover:text-primary"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          Keluar
        </button>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 border-r border-border bg-surface p-4 lg:block">
          <nav aria-label="Menu dashboard Produksi" className="space-y-2">
            {menuItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  pathname === href
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-slate-700 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <nav
            aria-label="Menu dashboard Produksi"
            className="mb-5 flex gap-2 overflow-x-auto lg:hidden"
          >
            {menuItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  pathname === href
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border bg-surface text-slate-700 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
