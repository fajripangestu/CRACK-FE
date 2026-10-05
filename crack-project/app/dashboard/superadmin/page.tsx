"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RoleDelegation from "@/app/components/roleDelegation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersTableProps {
  users: User[];
  token: string
}

export default function SuperadminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const tokenCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("token="));
    const savedToken = tokenCookie
      ? decodeURIComponent(tokenCookie.slice("token=".length))
      : null;

    if (!savedToken) {
      router.push("/login"); // redirect kalau belum login
    } else {
      setToken(savedToken);
    // Fetch daftar user dari backend
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((err) => console.error("Gagal fetch users:", err));
    }
  }, [router]);

  if (!token) return null;

const superadminMenus = [
  {
    title: "Manajemen Sistem",
    items: [
      "Pengaturan Aplikasi",
      "Pengaturan Database",
      "Role & Permission",
    ],
  },
  {
    title: "Manajemen Akun",
    items: [
      "Kelola Admin",
      "Kelola User",
      "Delegasi Hak Akses",
    ],
  },
  {
    title: "Monitoring & Audit",
    items: [
      "Log Aktivitas",
      "Statistik Global",
      "Audit Trail",
    ],
  },
  {
    title: "Keamanan",
    items: [
      "Manajemen Token/API",
      "Pengaturan Keamanan",
      "Alert & Notifikasi",
    ],
  },
  {
    title: "Operasional",
    items: [
      "Manajemen Produk/Konten",
      "Pengaturan Modul",
      "Integrasi Eksternal",
    ],
  },
];

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white shadow-md">
              SA
            </div>
            <div>
              <p className="text-lg font-semibold text-text">Superadmin</p>
              <p className="text-sm text-slate-500">Dashboard Kontrol Global</p>
            </div>
          </Link>

          <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/dashboard" className="transition hover:text-primary">
              Dashboard
            </Link>
            <Link href="/settings" className="transition hover:text-primary">
              Settings
            </Link>
            <Link href="/logout" className="transition hover:text-primary">
              Logout
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        <h1 className="text-3xl font-semibold mb-8">Manajemen Akun</h1>

        {/* Tabel User */}
        <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden mb-12">
          <thead>
            <tr className="bg-primary text-white text-left">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Role Delegation</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Updated At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr
                key={user.id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50 transition`}
              >
                <td className="border px-4 py-2">{user.id}</td>
                <td className="border px-4 py-2 font-medium">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold 
                    bg-primary text-white">
                    {user.role}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  <RoleDelegation user={user} token={token} />
                </td>
                <td className="border px-4 py-2">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {new Date(user.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid gap-6 md:grid-cols-2">
          {superadminMenus.map((menu) => (
            <div
              key={menu.title}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-primary mb-4">
                {menu.title}
              </h2>
              <ul className="space-y-2 text-sm text-slate-600">
                {menu.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-border bg-background px-4 py-2 hover:border-primary hover:text-primary transition"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/90 mt-12">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-600 lg:px-8">
          <p>© 2026 Superadmin Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

