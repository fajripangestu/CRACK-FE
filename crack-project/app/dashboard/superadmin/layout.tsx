// app/superadmin/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

const superadminMenus = [
  { title: "Manajemen Sistem", items: ["Pengaturan Aplikasi", "Pengaturan Database", "Role & Permission"] },
  { title: "Manajemen Akun", items: ["Kelola Admin", "Kelola User", "Delegasi Hak Akses"] },
  { title: "Monitoring & Audit", items: ["Log Aktivitas", "Statistik Global", "Audit Trail"] },
  { title: "Keamanan", items: ["Manajemen Token/API", "Pengaturan Keamanan", "Alert & Notifikasi"] },
  { title: "Operasional", items: ["Manajemen Produk/Konten", "Pengaturan Modul", "Integrasi Eksternal"] },
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

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/superadmin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white shadow-md">
              SA
            </div>
            <div>
              <p className="text-lg font-semibold text-text">Superadmin</p>
              <p className="text-sm text-slate-500">Dashboard Kontrol Global</p>
            </div>
          </Link>

          <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/dashboard/superadmin" className="transition hover:text-primary">Dashboard</Link>
            <Link href="/settings" className="transition hover:text-primary">Settings</Link>
            <Link href="/profile" className="transition hover:text-primary">My Profile</Link>
            <Link href="/logout" className="transition hover:text-primary">Logout</Link>
          </nav>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`sticky top-20 w-64 max-h-[calc(100vh-5rem)] overflow-y-auto border-r border-border bg-surface p-6
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
        >
          <nav className="space-y-4">
            {superadminMenus.map((menu) => (
              <div key={menu.title}>
                <h2 className="text-sm font-semibold text-primary mb-2">{menu.title}</h2>
                <ul className="space-y-1 text-sm text-slate-600">
                  {menu.items.map((item) => {
                    const slug = item.toLowerCase().replace(/\s+/g, "-");
                    return (
                      <li key={item}>
                        <Link
                          href={`/dashboard/superadmin/${slug}`}
                          className="block rounded-lg px-3 py-2 hover:bg-primary/10 hover:text-primary transition"
                        >
                          {item}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 lg:hidden transition-opacity duration-300 ease-in-out"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Konten utama */}
        <main className="flex-1 lg:ml-2 px-6 py-12">
          {/* Tombol hamburger */}
          <button
            className="lg:hidden mb-4 p-2 rounded border bg-primary text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="text-xl">{sidebarOpen ? "✕" : "≡"}</span>
          </button>

          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background/90">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-600 lg:px-8">
          <p>© 2026 Superadmin Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
