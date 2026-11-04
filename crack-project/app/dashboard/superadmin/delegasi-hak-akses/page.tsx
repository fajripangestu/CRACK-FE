"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDelegation from "@/app/components/roleDelegation";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import DepartmentDelegation from "@/app/components/departmentDelegation";
import PositionDelegation from "@/app/components/positionDelegation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const PAGE_SIZE = 10;
const DEPARTMENTS = [
  "PRODUCTION",
  "QA",
  "PPC",
  "PROCUREMENT",
  "ENGINEER",
  "IT",
  "SALES",
  "WAREHOUSE",
  "MAINTENANCE",
  "HRD",
  "OWNER",
  "CUSTOMER",
  "OTHER",
];
const POSITIONS = [
  "OWNER",
  "GENERAL_MANAGER",
  "CONSULTANT",
  "GM_ASSISTANT",
  "MANAGER",
  "SUPERVISOR",
  "TEAM_LEADER",
  "ENGINEER",
  "ADMINISTRATIVE_STAFF",
  "OPERATOR",
  "TESTER",
  "CUSTOMER",
  "INTERNSHIP",
  "OTHER",
];

const ROLE_STYLES: Record<string, string> = {
  USER: "bg-slate-100 text-slate-700 ring-slate-200",
  ADMIN: "bg-sky-50 text-sky-700 ring-sky-200",
  SUPER_ADMIN: "bg-violet-50 text-violet-700 ring-violet-200",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        ROLE_STYLES[role] ?? ROLE_STYLES.USER
      }`}
    >
      {role}
    </span>
  );
}

export default function DelegasiHakAksesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (authToken: string) => {
      try {
        setError(null);
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users ?? []);
      } catch (err) {
        console.error("Gagal fetch users:", err);
        setError("Data user gagal dimuat. Periksa koneksi lalu coba lagi.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const tokenCookie = document.cookie.split("; ").find((c) => c.startsWith("token="));
    const savedToken = tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;

    if (!savedToken) {
      router.replace("/login");
      return;
    }
    setToken(savedToken);
    fetchUsers(savedToken);
  }, [router, fetchUsers]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchDepartment = departmentFilter === "ALL" || u.department === departmentFilter;
      const matchPosition = positionFilter === "ALL" || u.position === positionFilter;
      return matchSearch && matchRole && matchDepartment && matchPosition;
    });
  }, [users, search, roleFilter, departmentFilter, positionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startNumber = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endNumber = Math.min(currentPage * PAGE_SIZE, filtered.length);

  if (!token) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-text">Delegasi Hak Akses</h1>
        <p className="mt-2 text-sm text-slate-600">
          Atur role tiap user. Perubahan tersimpan langsung dan tercatat di Activity Log.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap">
        <div className="relative min-w-56 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama atau email"
            aria-label="Cari user"
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter role"
          className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="ALL">Semua role</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter department"
          className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="ALL">Semua department</option>
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
        <select
          value={positionFilter}
          onChange={(e) => {
            setPositionFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter position"
          className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="ALL">Semua position</option>
          {POSITIONS.map((position) => (
            <option key={position} value={position}>
              {position.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-primary text-center text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role saat ini</th>
                <th className="px-4 py-3 font-semibold">Ubah role</th>
                <th className="px-4 py-3 font-semibold">Ubah Departemen</th>
                <th className="px-4 py-3 font-semibold">Ubah Posisi</th>
                <th className="px-4 py-3 font-semibold">Dibuat</th>
                <th className="px-4 py-3 font-semibold">Diperbarui</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-5 animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
                      <p className="text-slate-600">{error}</p>
                      <button
                        onClick={() => {
                          setLoading(true);
                          if (token) fetchUsers(token);
                        }}
                        className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text transition hover:bg-background"
                      >
                        Muat ulang
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    {users.length === 0
                      ? "Belum ada user terdaftar."
                      : "Tidak ada user yang cocok dengan pencarian atau filter."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                pageItems.map((user) => (
                  <tr key={user.id} className="transition hover:bg-background">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(user.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-text">{user.name}</p>
                          <p className="truncate text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <RoleDelegation
                        user={user}
                        token={token}
                        onRoleChange={(newRole, updatedAt) => {
                          setUsers((prev) =>
                            prev.map((u) =>
                              u.id === user.id ? { ...u, role: newRole, updatedAt } : u
                            )
                          );
                          showToast(`Role ${user.name} diubah menjadi ${newRole}.`);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <DepartmentDelegation
                        user={user}
                        token={token}
                        onDepartmentChange={(newDepartment, updatedAt) => {
                          setUsers((prev) =>
                            prev.map((u) =>
                              u.id === user.id ? { ...u, department: newDepartment, updatedAt } : u
                            )
                          );
                          showToast(`Department ${user.name} diubah menjadi ${newDepartment}.`);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <PositionDelegation
                        user={user}
                        token={token}
                        onPositionChange={(newPosition, updatedAt) => {
                          setUsers((prev) =>
                            prev.map((u) =>
                              u.id === user.id ? { ...u, position: newPosition, updatedAt } : u
                            )
                          );
                          showToast(`Position ${user.name} diubah menjadi ${newPosition}.`);
                        }}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(user.updatedAt)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Paginasi */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-slate-600 sm:flex-row">
            <p>
              Menampilkan {startNumber}–{endNumber} dari {filtered.length} user
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Halaman sebelumnya"
                className="rounded-full border border-border p-2 transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="min-w-[5rem] text-center">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Halaman berikutnya"
                className="rounded-full border border-border p-2 transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <CheckCircleIcon className="h-5 w-5" />
          {toast}
        </div>
      )}
    </div>
  );
}
