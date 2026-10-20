"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  CubeIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserCircleIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const DASHBOARD_HREF = "/dashboard/superadmin";
const SIDEBAR_KEY = "superadmin-sidebar-open";

const superadminMenus = [
  {
    title: "Manajemen Sistem",
    icon: Cog6ToothIcon,
    items: ["Pengaturan Aplikasi", "Pengaturan Database", "Role & Permission"],
  },
  {
    title: "Manajemen Akun",
    icon: UsersIcon,
    items: ["Kelola Admin", "Kelola User", "Delegasi Hak Akses"],
  },
  {
    title: "Monitoring & Audit",
    icon: ChartBarIcon,
    items: ["Log Aktivitas", "Statistik Global", "Audit Trail"],
  },
  {
    title: "Keamanan",
    icon: ShieldCheckIcon,
    items: ["Manajemen Token/API", "Pengaturan Keamanan", "Alert & Notifikasi"],
  },
  {
    title: "Operasional",
    icon: CubeIcon,
    items: ["Manajemen Produk/Konten", "Pengaturan Modul", "Integrasi Eksternal"],
  },
];

const slugMap: Record<string, string> = {
  "Pengaturan Aplikasi": "pengaturan-aplikasi",
  "Pengaturan Database": "pengaturan-database",
  "Role & Permission": "role-permission",
  "Kelola Admin": "kelola-admin",
  "Kelola User": "kelola-user",
  "Delegasi Hak Akses": "delegasi-hak-akses",
  "Log Aktivitas": "log-aktivitas",
  "Statistik Global": "statistik-global",
  "Audit Trail": "audit-trail",
  "Manajemen Token/API": "manajemen-token-api",
  "Pengaturan Keamanan": "pengaturan-keamanan",
  "Alert & Notifikasi": "alert-notifikasi",
  "Manajemen Produk/Konten": "manajemen-produk-konten",
  "Pengaturan Modul": "pengaturan-modul",
  "Integrasi Eksternal": "integrasi-eksternal",
};

const toSlug = (item: string) => slugMap[item] || item.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Desktop: sidebar bisa disembunyikan (preferensi disimpan). Mobile: sidebar berupa drawer.
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Baca preferensi tersimpan
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY);
      if (saved !== null) setDesktopOpen(saved === "true");
    } catch {
      // abaikan jika localStorage tidak tersedia
    }
  }, []);

  const toggleDesktop = () => {
    setDesktopOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next));
      } catch {
        // abaikan
      }
      return next;
    });
  };

  // Tutup drawer mobile saat pindah halaman
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Tutup drawer dengan Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const handleLogout = () => {
    document.cookie = "token=; Path=/; Max-Age=0";
    window.location.href = "/login";
  };

  const linkBase =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      {/* Navbar */}
      <header className="sticky top-0 z-30 h-16 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Tombol sidebar: drawer di mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
              aria-controls="sidebar"
              aria-expanded={mobileOpen}
              className="rounded-lg border border-border p-2 text-slate-600 transition hover:bg-surface hover:text-primary lg:hidden"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            {/* Tombol sidebar: hide/unhide di desktop */}
            <button
              onClick={toggleDesktop}
              aria-label={desktopOpen ? "Sembunyikan sidebar" : "Tampilkan sidebar"}
              aria-controls="sidebar"
              aria-expanded={desktopOpen}
              title={desktopOpen ? "Sembunyikan sidebar" : "Tampilkan sidebar"}
              className="hidden rounded-lg border border-border p-2 text-slate-600 transition hover:bg-surface hover:text-primary lg:inline-flex"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            <Link href={DASHBOARD_HREF} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-base font-semibold text-white shadow-md">
                SA
              </span>
              <span className="hidden sm:block">
                <span className="block text-base font-semibold leading-tight text-text">Superadmin</span>
                <span className="block text-xs text-slate-500">Dashboard Kontrol Global</span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
            <Link
              href="/settings"
              className="rounded-full px-3 py-2 transition hover:bg-surface hover:text-primary"
            >
              Settings
            </Link>
            <Link
              href="/profile"
              className="rounded-full px-3 py-2 transition hover:bg-surface hover:text-primary"
            >
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="ml-1 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 transition hover:bg-surface hover:text-primary"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Overlay mobile */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-surface transition-transform duration-300 ease-in-out
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            lg:sticky lg:top-16 lg:z-10 lg:h-[calc(100vh-4rem)] lg:shrink-0 lg:translate-x-0 lg:overflow-hidden lg:transition-[width]
            ${desktopOpen ? "lg:w-64" : "lg:invisible lg:w-0 lg:border-r-0"}`}
        >
          <div className="flex h-full w-72 flex-col overflow-y-auto p-4 lg:w-64">
            {/* Header drawer (mobile) */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <p className="font-semibold text-primary">Menu</p>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="rounded-lg p-2 text-slate-500 hover:bg-background hover:text-primary"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-6">
              <Link
                href={DASHBOARD_HREF}
                aria-current={pathname === DASHBOARD_HREF ? "page" : undefined}
                className={`${linkBase} font-medium ${
                  pathname === DASHBOARD_HREF
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
                Dashboard
              </Link>

              {superadminMenus.map((menu) => {
                const Icon = menu.icon;
                return (
                  <div key={menu.title}>
                    <h2 className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold text-slate-500">
                      <Icon className="h-4 w-4" />
                      {menu.title}
                    </h2>
                    <ul className="space-y-1">
                      {menu.items.map((item) => {
                        const href = `${DASHBOARD_HREF}/${toSlug(item)}`;
                        const active = isActive(href);
                        return (
                          <li key={item}>
                            <Link
                              href={href}
                              aria-current={active ? "page" : undefined}
                              className={`${linkBase} ${
                                active
                                  ? "bg-primary/10 font-medium text-primary"
                                  : "text-slate-600 hover:bg-primary/10 hover:text-primary"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  active ? "bg-primary" : "bg-slate-300"
                                }`}
                              />
                              {item}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>

            {/* Akun: hanya tampil di layar kecil, karena navbar menyembunyikan menu ini */}
            <div className="mt-6 space-y-1 border-t border-border pt-4 md:hidden">
              <Link href="/settings" className={`${linkBase} text-slate-600 hover:bg-primary/10 hover:text-primary`}>
                <Cog6ToothIcon className="h-4 w-4" />
                Settings
              </Link>
              <Link href="/profile" className={`${linkBase} text-slate-600 hover:bg-primary/10 hover:text-primary`}>
                <UserCircleIcon className="h-4 w-4" />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className={`${linkBase} w-full text-slate-600 hover:bg-primary/10 hover:text-primary`}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Konten utama */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background/90">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-slate-600 lg:px-8">
          <p>© 2026 Superadmin Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
