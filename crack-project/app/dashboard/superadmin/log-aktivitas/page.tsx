"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLongRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface UserHistory {
  id: string;
  action: string;
  status: boolean;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: string;
  userName: string | null;
  modifier?: { name: string } | null;
  user?: { name: string } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const PAGE_SIZE = 10;

// Field yang nilainya tidak boleh ditampilkan apa adanya
const SENSITIVE_FIELDS = ["password"];

const FIELD_LABELS: Record<string, string> = {
  user: "User",
  name: "Nama",
  email: "Email",
  role: "Role",
  department: "Department",
  position: "Position",
  password: "Password",
};

const FIELD_STYLES: Record<string, string> = {
  user: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  name: "bg-sky-50 text-sky-700 ring-sky-200",
  email: "bg-amber-50 text-amber-700 ring-amber-200",
  role: "bg-violet-50 text-violet-700 ring-violet-200",
  department: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  position: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  password: "bg-rose-50 text-rose-700 ring-rose-200",
};

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  EDIT: "bg-blue-50 text-blue-700 ring-blue-200",
  DELETE: "bg-red-50 text-red-700 ring-red-200",
};

const fieldLabel = (field: string) => FIELD_LABELS[field] ?? field;

const formatDate = (value: string) =>
  new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

function FieldBadge({ field }: { field: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        FIELD_STYLES[field] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {fieldLabel(field)}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
        ACTION_STYLES[action] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {action.toLowerCase()}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Aktif" : "Tidak aktif"}
    </span>
  );
}

function ValueChip({ value, tone }: { value: string | null; tone: "old" | "new" }) {
  if (value === null || value === "") {
    return <span className="text-slate-400">kosong</span>;
  }
  return (
    <span
      className={`inline-block max-w-[14rem] truncate rounded-md px-2 py-0.5 align-middle text-xs ${
        tone === "old" ? "bg-slate-100 text-slate-500 line-through" : "bg-primary/10 text-primary"
      }`}
      title={value}
    >
      {value}
    </span>
  );
}

function Change({ h }: { h: UserHistory }) {
  if (SENSITIVE_FIELDS.includes(h.field)) {
    return <span className="text-slate-500">Password diubah</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ValueChip value={h.oldValue} tone="old" />
      <ArrowLongRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
      <ValueChip value={h.newValue} tone="new" />
    </div>
  );
}

export default function ActivityLogPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [histories, setHistories] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [newestFirst, setNewestFirst] = useState(true);
  const [page, setPage] = useState(1);

  const fetchHistories = useCallback(
    async (authToken: string) => {
      try {
        setError(null);
        const res = await fetch(`${API_URL}/userHistories`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        setToken(authToken);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        setHistories(await res.json());
      } catch (err) {
        setToken(authToken);
        console.error("Gagal fetch user histories:", err);
        setError("Riwayat aktivitas gagal dimuat. Periksa koneksi lalu coba lagi.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    let cancelled = false;

    const loadHistories = async () => {
      const tokenCookie = document.cookie.split("; ").find((c) => c.startsWith("token="));
      const savedToken = tokenCookie
        ? decodeURIComponent(tokenCookie.slice("token=".length))
        : null;

      if (!savedToken) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/userHistories`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setToken(savedToken);
        setHistories(data);
      } catch (err) {
        if (cancelled) return;
        setToken(savedToken);
        console.error("Gagal fetch user histories:", err);
        setError("Riwayat aktivitas gagal dimuat. Periksa koneksi lalu coba lagi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadHistories();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const fieldOptions = useMemo(
    () => Array.from(new Set(histories.map((h) => h.field))).sort(),
    [histories]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = histories.filter((h) => {
      const matchField = fieldFilter === "ALL" || h.field === fieldFilter;
      const matchAction = actionFilter === "ALL" || h.action === actionFilter;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? h.status : !h.status);
      const matchSearch =
        !q ||
        (h.user?.name ?? "").toLowerCase().includes(q) ||
        (h.userName ?? "").toLowerCase().includes(q) ||
        (h.modifier?.name ?? "").toLowerCase().includes(q) ||
        (!SENSITIVE_FIELDS.includes(h.field) &&
          ((h.oldValue ?? "").toLowerCase().includes(q) ||
            (h.newValue ?? "").toLowerCase().includes(q)));
      return matchField && matchAction && matchStatus && matchSearch;
    });
    result.sort((a, b) => {
      const diff = new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime();
      return newestFirst ? -diff : diff;
    });
    return result;
  }, [histories, search, fieldFilter, actionFilter, statusFilter, newestFirst]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startNumber = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endNumber = Math.min(currentPage * PAGE_SIZE, filtered.length);

  if (!token) return null;

  return (
    <div className="w-full py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-text">Activity Log</h1>
        <p className="mt-2 text-sm text-slate-600">
          Riwayat perubahan data user: siapa yang diubah, apa yang berubah, dan siapa yang mengubahnya.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari user, pengubah, atau nilai"
            aria-label="Cari aktivitas"
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <select
          value={fieldFilter}
          onChange={(e) => {
            setFieldFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter field"
          className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="ALL">Semua field</option>
          {fieldOptions.map((f) => (
            <option key={f} value={f}>
              {fieldLabel(f)}
            </option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter aksi"
          className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="ALL">Semua aksi</option>
          <option value="CREATE">Create</option>
          <option value="EDIT">Edit</option>
          <option value="DELETE">Delete</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter status"
          className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="ALL">Semua status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Tidak aktif</option>
        </select>
        <select
          value={newestFirst ? "desc" : "asc"}
          onChange={(e) => {
            setNewestFirst(e.target.value === "desc");
            setPage(1);
          }}
          aria-label="Urutan tanggal"
          className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="desc">Terbaru dulu</option>
          <option value="asc">Terlama dulu</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-primary text-center text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Field</th>
                <th className="px-4 py-3 font-semibold">Perubahan</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Diubah oleh</th>
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
                          if (token) fetchHistories(token);
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
                    {histories.length === 0
                      ? "Belum ada riwayat perubahan."
                      : "Tidak ada aktivitas yang cocok dengan pencarian atau filter."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                pageItems.map((h) => (
                  <tr key={h.id} className="align-top transition hover:bg-background">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(h.changedAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-text">
                      {h.userName ?? h.user?.name ?? "Tidak diketahui"}
                    </td>
                    <td className="px-4 py-3">
                      <FieldBadge field={h.field} />
                    </td>
                    <td className="px-4 py-3">
                      <Change h={h} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={h.action} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={h.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{h.modifier?.name ?? "Tidak diketahui"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Paginasi */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-slate-600 sm:flex-row">
            <p>
              Menampilkan {startNumber}–{endNumber} dari {filtered.length} aktivitas
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
    </div>
  );
}