"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ClipboardDocumentCheckIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import CurrentUserGreeting from "../components/CurrentUserGreeting";

const PROCUREMENT_HREF = "/dashboard/procurement";
const menuItems = [
  { label: "Beranda", href: PROCUREMENT_HREF, icon: Squares2X2Icon },
  {
    label: "Persetujuan Customer Order",
    href: `${PROCUREMENT_HREF}/persetujuan-order`,
    icon: ClipboardDocumentCheckIcon,
  },
];

export default function ProcurementDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleLogout() {
    document.cookie = "token=; Path=/; Max-Age=0";
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
            aria-controls="procurement-sidebar"
            aria-expanded={mobileOpen}
            className="rounded-lg border border-border p-2 text-slate-600 transition hover:bg-surface hover:text-primary lg:hidden"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setDesktopOpen((open) => !open)}
            aria-label={desktopOpen ? "Sembunyikan sidebar" : "Tampilkan sidebar"}
            aria-controls="procurement-sidebar"
            aria-expanded={desktopOpen}
            title={desktopOpen ? "Sembunyikan sidebar" : "Tampilkan sidebar"}
            className="hidden rounded-lg border border-border p-2 text-slate-600 transition hover:bg-surface hover:text-primary lg:inline-flex"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <Link href={PROCUREMENT_HREF} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-semibold text-white shadow-md">
              M
            </span>
            <span>
              <span className="block font-semibold leading-tight text-text">Manutics</span>
              <span className="block text-xs text-slate-500">Dashboard Procurement</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <CurrentUserGreeting />
          <Link
            href={`${PROCUREMENT_HREF}/profile`}
            className="rounded-full border border-border px-3 py-2 text-sm text-slate-700 transition hover:bg-primary/10 hover:text-primary"
          >
            Profil Saya
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-slate-700 transition hover:bg-primary/10 hover:text-primary"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          id="procurement-sidebar"
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-surface p-4 transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } lg:sticky lg:top-16 lg:z-10 lg:h-[calc(100vh-4rem)] lg:shrink-0 lg:translate-x-0 lg:overflow-y-auto lg:transition-[width] ${
            desktopOpen ? "lg:w-72" : "lg:invisible lg:w-0 lg:overflow-hidden lg:border-r-0 lg:p-0"
          }`}
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <p className="font-semibold text-primary">Menu</p>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="rounded-lg p-2 text-slate-500 hover:bg-background hover:text-primary"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label="Menu dashboard Procurement" className="space-y-2">
            {menuItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
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
          {children}
        </main>
      </div>
    </div>
  );
}
