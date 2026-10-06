"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const superadminMenus = [
  { 
    title: "Manajemen Sistem", 
    description: "Kelola konfigurasi aplikasi, database, serta role & permission.", 
    items: ["Pengaturan Aplikasi", "Pengaturan Database", "Role & Permission"] 
  },
  { 
    title: "Manajemen Akun", 
    description: "Atur admin, user, dan delegasi hak akses.", 
    items: ["Kelola Admin", "Kelola User", "Delegasi Hak Akses"] 
  },
  { 
    title: "Monitoring & Audit", 
    description: "Pantau aktivitas sistem, statistik global, dan audit trail.", 
    items: ["Log Aktivitas", "Statistik Global", "Audit Trail"] 
  },
  { 
    title: "Keamanan", 
    description: "Kelola token, pengaturan keamanan, serta alert & notifikasi.", 
    items: ["Manajemen Token/API", "Pengaturan Keamanan", "Alert & Notifikasi"] 
  },
  { 
    title: "Operasional", 
    description: "Kelola produk, modul, dan integrasi eksternal.", 
    items: ["Manajemen Produk/Konten", "Pengaturan Modul", "Integrasi Eksternal"] 
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

export default function SuperadminDashboardLanding() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
  const tokenCookie = document.cookie.split("; ").find((c) => c.startsWith("token="));
  const savedToken = tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;

  if (!savedToken) {
    console.error("Token tidak ditemukan, redirect ke login");
    return;
  }

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setUsers(data);
          } else if (Array.isArray(data.users)) {
            setUsers(data.users);
          } else {
            console.error("Format data tidak sesuai:", data);
          }
        })
        .catch((err) => console.error("Gagal fetch users:", err));
    }, []);

  // contoh data dummy statistik
  const stats = [
    { label: "Log Aktivitas", value: 540 },
    { label: "Produk Aktif", value: 87 },
  ];

  return (
    <div className="min-h-screen bg-background text-text px-6 py-2 lg:px-8">
      <h1 className="text-3xl font-semibold mb-8">
        Selamat datang di Dashboard Superadmin. Berikut rangkuman menu utama untuk mengelola sistem secara global.
      </h1>

      {/* Statistik ringkas */}
      <div className="grid gap-6 mb-12 sm:grid-cols-2 lg:grid-cols-5">
      {/* Total Super Admin */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition">
        <p className="text-sm text-slate-500">Total Super Admin</p>
        <p className="text-2xl font-bold text-primary">
          {users.filter(u => u.role === "SUPER_ADMIN").length}
        </p>
      </div>

      {/* Total Admin */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition">
        <p className="text-sm text-slate-500">Total Admin</p>
        <p className="text-2xl font-bold text-primary">
          {users.filter(u => u.role === "ADMIN").length}
        </p>
      </div>

      {/* Total User */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition">
        <p className="text-sm text-slate-500">Total User</p>
        <p className="text-2xl font-bold text-primary">
          {users.filter(u => u.role === "USER").length}
        </p>
      </div>

      {/* Statistik dummy */}
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition"
        >
          <p className="text-sm text-slate-500">{stat.label}</p>
          <p className="text-2xl font-bold text-primary">{stat.value}</p>
        </div>
      ))}
    </div>

      {/* Grid ringkasan menu */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {superadminMenus.map((menu) => (
          <div
            key={menu.title}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold text-primary mb-2">{menu.title}</h2>
            <p className="text-sm text-slate-600 mb-4">{menu.description}</p>
            <ul className="space-y-2 text-sm text-slate-700">
              {menu.items.map((item) => {
                const slug = slugMap[item] || item.toLowerCase().replace(/\s+/g, "-");
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
      </div>
    </div>
  );
}