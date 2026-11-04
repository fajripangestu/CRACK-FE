"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CubeIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const superadminMenus = [
  {
    title: "Manajemen Sistem",
    description: "Kelola konfigurasi aplikasi, database, serta role & permission.",
    icon: Cog6ToothIcon,
    items: ["Pengaturan Aplikasi", "Pengaturan Database", "Role & Permission"],
  },
  {
    title: "Manajemen Akun",
    description: "Atur admin, user, dan delegasi hak akses.",
    icon: UsersIcon,
    items: ["Kelola Admin", "Kelola User", "Delegasi Hak Akses"],
  },
  {
    title: "Monitoring & Audit",
    description: "Pantau aktivitas sistem, statistik global, dan audit trail.",
    icon: ChartBarIcon,
    items: ["Log Aktivitas", "Statistik Global", "Audit Trail"],
  },
  {
    title: "Keamanan",
    description: "Kelola token, pengaturan keamanan, serta alert & notifikasi.",
    icon: ShieldCheckIcon,
    items: ["Manajemen Token/API", "Pengaturan Keamanan", "Alert & Notifikasi"],
  },
  {
    title: "Operasional",
    description: "Kelola produk, modul, dan integrasi eksternal.",
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

const toSlug = (item: string) => slugMap[item] || item.toLowerCase().replace(/\s+/g, "-");

function StatCard({
  label,
  value,
  loading,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  loading: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default function SuperadminDashboardLanding() {
  const [users, setUsers] = useState<User[]>([]);
  const [userHistories, setuserHistories] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const tokenCookie = document.cookie.split("; ").find((c) => c.startsWith("token="));
    const savedToken = tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;

    if (!savedToken) {
      setError("Sesi tidak ditemukan. Silakan login ulang.");
      setLoadingUsers(false);
      return;
    }

    const headers = { Authorization: `Bearer ${savedToken}` };

    // Cek akses dashboard superadmin
    fetch(`${API_URL}/dashboard/superadmin`, { headers, credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
      })
      .catch(() => setError("Data dashboard gagal dimuat. Coba muat ulang halaman."));

    // Ambil daftar user untuk statistik
    fetch(`${API_URL}/users`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        else if (Array.isArray(data.users)) setUsers(data.users);
        else console.error("Format data tidak sesuai:", data);
      })
      .catch((err) => {
        console.error("Gagal fetch users:", err);
        setError("Data dashboard gagal dimuat. Coba muat ulang halaman.");
      })
      .finally(() => setLoadingUsers(false));
  fetch(`${API_URL}/userHistories`, { headers })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      setuserHistories(data);
    })
    .catch((err) => {
      console.error("Gagal fetch history:", err);
    });
  }, []);

  const countByRole = (role: string) => users.filter((u) => u.role === role).length;

  // Filter menu berdasarkan pencarian (judul grup atau nama item)
  const filteredMenus = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return superadminMenus;
    return superadminMenus
      .map((menu) => {
        const groupMatch = menu.title.toLowerCase().includes(q);
        const items = groupMatch ? menu.items : menu.items.filter((i) => i.toLowerCase().includes(q));
        return { ...menu, items };
      })
      .filter((menu) => menu.items.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-background px-6 py-6 text-text lg:px-8">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard Superadmin</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Ringkasan akun dan menu utama untuk mengelola sistem secara global.
          </p>
        </div>

        <div className="relative w-full lg:w-72">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu"
            aria-label="Cari menu"
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </header>

      {/* Pesan error */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Statistik */}
      <section aria-label="Statistik ringkas" className="mb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Super Admin"
            value={countByRole("SUPER_ADMIN")}
            loading={loadingUsers}
            icon={ShieldCheckIcon}
          />
          <StatCard
            label="Total Admin"
            value={countByRole("ADMIN")}
            loading={loadingUsers}
            icon={UsersIcon}
          />
          <StatCard
            label="Total User"
            value={countByRole("USER")}
            loading={loadingUsers}
            icon={UsersIcon}
          />
          <StatCard
            label="Log Aktivitas"
            value={userHistories.length}
            loading={false}
            icon={ClipboardDocumentListIcon}
          />
          <StatCard
            label="Produk Aktif"
            value={0}
            loading={false}
            icon={Squares2X2Icon}
            hint="Belum terhubung"
          />
        </div>
      </section>

      {/* Menu */}
      <section aria-label="Menu utama">
        <h2 className="mb-4 text-lg font-semibold">Menu utama</h2>

        {filteredMenus.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center text-sm text-slate-500">
            Tidak ada menu yang cocok dengan “{query}”.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMenus.map((menu) => {
              const Icon = menu.icon;
              return (
                <div
                  key={menu.title}
                  className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-semibold text-primary">{menu.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{menu.description}</p>

                  <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                    {menu.items.map((item) => (
                      <li key={item}>
                        <Link
                          href={`/dashboard/superadmin/${toSlug(item)}`}
                          className="group flex items-center justify-between rounded-lg px-3 py-2 text-slate-700 transition hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          {item}
                          <ChevronRightIcon className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
