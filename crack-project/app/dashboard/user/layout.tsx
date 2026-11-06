"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CurrentUserGreeting from "../components/CurrentUserGreeting";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CubeIcon,
  FolderIcon,
  LifebuoyIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const DASHBOARD_HREF = "/dashboard/user";
const SIDEBAR_KEY = "user-sidebar-open";

const userMenus = [
  {
    title: "Belanja",
    icon: ShoppingBagIcon,
    items: [
      { label: "Katalog Produk", slug: "katalog-produk" },
      { label: "Keranjang", slug: "keranjang" },
      { label: "Permintaan Penawaran (RFQ)", slug: "rfq" },
      { label: "Penawaran Saya", slug: "penawaran-saya" },
    ],
  },
  {
    title: "Pesanan & Tagihan",
    icon: ClipboardDocumentListIcon,
    items: [
      { label: "Pesanan Saya", slug: "pesanan" },
      { label: "Tagihan", slug: "tagihan" },
      { label: "Dokumen", slug: "dokumen" },
    ],
  },
  {
    title: "Akun Perusahaan",
    icon: BuildingOffice2Icon,
    items: [{ label: "Alamat Pengiriman", slug: "alamat-pengiriman" }],
  },
  {
    title: "Bantuan",
    icon: LifebuoyIcon,
    items: [
      { label: "Notifikasi", slug: "notifikasi" },
      { label: "Pusat Bantuan", slug: "pusat-bantuan" },
    ],
  },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
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
        <div className="flex h-full w-full items-center justify-between gap-4 px-4 lg:px-6">
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
                M
              </span>
              <span className="hidden sm:block">
                <span className="block text-base font-semibold leading-tight text-text">Manutics</span>
                <span className="block text-xs text-slate-500">Dashboard Pelanggan</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <CurrentUserGreeting />
          <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
            <Link
              href={`${DASHBOARD_HREF}/notifikasi`}
              aria-label="Notifikasi"
              className="rounded-full p-2 transition hover:bg-surface hover:text-primary"
            >
              <BellIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/settings"
              className="rounded-full px-3 py-2 transition hover:bg-surface hover:text-primary"
            >
              Pengaturan
            </Link>
            <Link
              href={`${DASHBOARD_HREF}/profile`}
              className="rounded-full px-3 py-2 transition hover:bg-surface hover:text-primary"
            >
              Profil Saya
            </Link>
            <button
              onClick={handleLogout}
              className="ml-1 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 transition hover:bg-surface hover:text-primary"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Keluar
            </button>
          </nav>
          </div>
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

              {userMenus.map((menu) => {
                const Icon = menu.icon;
                return (
                  <div key={menu.title}>
                    <h2 className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold text-slate-500">
                      <Icon className="h-4 w-4" />
                      {menu.title}
                    </h2>
                    <ul className="space-y-1">
                      {menu.items.map((item) => {
                        const href = `${DASHBOARD_HREF}/${item.slug}`;
                        const active = isActive(href);
                        return (
                          <li key={item.slug}>
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
                              {item.label}
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
                Pengaturan
              </Link>
              <Link href={`${DASHBOARD_HREF}/profile`} className={`${linkBase} text-slate-600 hover:bg-primary/10 hover:text-primary`}>
                <UserCircleIcon className="h-4 w-4" />
                Profil Saya
              </Link>
              <button
                onClick={handleLogout}
                className={`${linkBase} w-full text-slate-600 hover:bg-primary/10 hover:text-primary`}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        </aside>

        {/* Konten utama */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background/90">
        <div className="w-full px-4 py-6 text-sm text-slate-600 lg:px-6">
          <p>© 2026 Manutics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
