"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role | string;
  department: string;
  position: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  position: string;
}

interface Toast {
  type: "success" | "error";
  message: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  password: "",
  role: "USER",
  department: "CUSTOMER",
  position: "CUSTOMER",
};

const ROLE_STYLES: Record<string, string> = {
  USER: "bg-slate-100 text-slate-700 ring-slate-200",
  ADMIN: "bg-blue-50 text-blue-700 ring-blue-200",
  SUPER_ADMIN: "bg-red-50 text-red-700 ring-violet-200",
};

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

export default function KelolaUserPage() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: Toast["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ---------- Data ----------
  const fetchUsers = useCallback(
    async (authToken: string) => {
      try {
        setLoadError(null);
        const res = await fetch(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        setUsers(await res.json());
      } catch (err) {
        console.error("Gagal fetch users:", err);
        setLoadError("Data user gagal dimuat. Periksa koneksi lalu coba lagi.");
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  useEffect(() => {
    const tokenCookie = document.cookie.split("; ").find((c) => c.startsWith("token="));
    const savedToken = tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;

    if (!savedToken) {
      router.push("/login");
      return;
    }
    setToken(savedToken);
    fetchUsers(savedToken);
  }, [router, fetchUsers]);

  // Tutup modal / panel dengan tombol Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isDeleteConfirmOpen) setIsDeleteConfirmOpen(false);
      else if (isModalOpen) setIsModalOpen(false);
      else setSelectedUser(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDeleteConfirmOpen, isModalOpen]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchDepartment = departmentFilter === "ALL" || u.department === departmentFilter;
      const matchPosition = positionFilter === "ALL" || u.position === positionFilter;
      return matchSearch && matchRole && matchDepartment && matchPosition;
    });
  }, [users, search, roleFilter, departmentFilter, positionFilter]);

  // ---------- Modal ----------
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role as Role,
      department: user.department,
      position: user.position,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.name.trim()) return setFormError("Nama wajib diisi.");
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return setFormError("Format email belum benar.");
    if (!editingUser && formData.password.length < 8)
      return setFormError("Password minimal 8 karakter.");

    setSaving(true);
    setFormError(null);

    try {
      // Saat edit, password tidak dikirim
      const { password, ...rest } = formData;
      const payload = editingUser
        ? rest
        : {
            name: formData.name,
            email: formData.email,
            password,
            role: formData.role,
            department: formData.department,
            position: formData.position,
          };

      const res = await fetch(
        editingUser ? `${apiUrl}/users/${editingUser.id}` : `${apiUrl}/users`,
        {
          method: editingUser ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Gagal menyimpan (status ${res.status})`);
      }

      await fetchUsers(token);
      // Perbarui panel detail jika user yang sedang dilihat diedit
      if (editingUser && selectedUser?.id === editingUser.id) {
        setSelectedUser((prev) => (prev ? { ...prev, ...rest } : prev));
      }
      setIsModalOpen(false);
      showToast("success", editingUser ? "Perubahan user disimpan." : "User baru ditambahkan.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingUser || !token || saving) return;

    setSaving(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${apiUrl}/users/${editingUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Gagal menghapus user (status ${res.status})`);
      }

      setUsers((prev) => prev.filter((user) => user.id !== editingUser.id));
      setSelectedUser((prev) => (prev?.id === editingUser.id ? null : prev));
      setIsDeleteConfirmOpen(false);
      setIsModalOpen(false);
      showToast("success", "User berhasil dinonaktifkan.");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Terjadi kesalahan saat menonaktifkan user.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------
  if (!token) return null;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola User</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? "Memuat data…" : `${users.length} user terdaftar`}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <PlusIcon className="h-4 w-4" />
          Tambah user
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-56 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email"
            aria-label="Cari user"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Filter role"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="ALL">Semua role</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          aria-label="Filter department"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          onChange={(e) => setPositionFilter(e.target.value)}
          aria-label="Filter position"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="ALL">Semua position</option>
          {POSITIONS.map((position) => (
            <option key={position} value={position}>
              {position.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Tabel */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-primary text-center text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-4">
                        <div className="h-5 animate-pulse rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))}

                {!loading && loadError && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <p className="text-slate-600">{loadError}</p>
                      <button
                        onClick={() => {
                          setLoading(true);
                          if (token) fetchUsers(token);
                        }}
                        className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Muat ulang
                      </button>
                    </td>
                  </tr>
                )}

                {!loading && !loadError && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      {users.length === 0
                        ? "Belum ada user. Klik “Tambah user” untuk membuat yang pertama."
                        : "Tidak ada user yang cocok dengan pencarian."}
                    </td>
                  </tr>
                )}

                {!loading &&
                  !loadError &&
                  filteredUsers.map((u) => {
                    const active = selectedUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedUser(u);
                          }
                        }}
                        aria-selected={active}
                        className={`cursor-pointer outline-none transition hover:bg-slate-50 focus-visible:bg-blue-50 ${
                          active ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                              {initials(u.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">{u.name}</p>
                              <p className="truncate text-xs text-slate-500 sm:hidden">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{u.email}</td>
                        <td className="px-4 py-3">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">{u.department || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{u.position || "—"}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel detail */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedUser ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-700">
                      {initials(selectedUser.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{selectedUser.name}</p>
                      <p className="truncate text-sm text-slate-500">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    aria-label="Tutup detail"
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Role</dt>
                    <dd>
                      <RoleBadge role={selectedUser.role} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Department</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {selectedUser.department || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Position</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {selectedUser.position || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Dibuat</dt>
                    <dd className="text-right text-slate-900">{formatDate(selectedUser.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Diperbarui</dt>
                    <dd className="text-right text-slate-900">{formatDate(selectedUser.updatedAt)}</dd>
                  </div>
                </dl>

                <button
                  onClick={() => openEditModal(selectedUser)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit user
                </button>
              </>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Pilih satu user di tabel untuk melihat detailnya.
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Modal tambah / edit */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="user-modal-title" className="text-lg font-semibold text-slate-900">
                {editingUser ? "Edit user" : "Tambah user"}
              </h2>
              <button
                onClick={closeModal}
                aria-label="Tutup"
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                  Nama
                </label>
                <input
                  id="name"
                  type="text"
                  autoFocus
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {!editingUser && (
                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-xs text-slate-500">Minimal 8 karakter.</p>
                </div>
              )}

              <div>
                <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div>
                <label htmlFor="department" className="mb-1 block text-sm font-medium text-slate-700">
                  Department
                </label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="position" className="mb-1 block text-sm font-medium text-slate-700">
                  Position
                </label>
                <select
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {position.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                {editingUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setIsDeleteConfirmOpen(true);
                    }}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Nonaktifkan user
                  </button>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                    {saving ? "Menyimpan…" : "Simpan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && editingUser && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setIsDeleteConfirmOpen(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            aria-describedby="delete-user-description"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <ExclamationCircleIcon className="h-6 w-6" />
              </span>
              <div>
                <h2 id="delete-user-title" className="text-lg font-semibold text-slate-900">
                  Nonaktifkan user?
                </h2>
                <p id="delete-user-description" className="mt-2 text-sm leading-6 text-slate-600">
                  Akun <span className="font-semibold text-slate-900">{editingUser.name}</span>{" "}
                  akan ditandai tidak aktif dan tidak dapat login. Tindakan ini bisa dibatalkan
                  oleh administrator.
                </p>
              </div>
            </div>

            {deleteError && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
                {saving ? "Menonaktifkan…" : "Ya, nonaktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
