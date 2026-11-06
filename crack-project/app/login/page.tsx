"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// Akun simulasi: ganti dengan data user yang ada di database/seed kamu
const DEMO_ACCOUNTS = [
  {
    label: "Super Admin",
    role: "SUPER_ADMIN",
    email: "superadmin@example.com",
    password: "super1234admin",
  },
  {
    label: "Production Admin",
    role: "ADMIN",
    department: "PRODUCTION",
    email: "productionadmin@example.com",
    password: "admin1234",
  },
  {
    label: "Sales Admin",
    role: "ADMIN",
    department: "SALES",
    email: "salesadmin@example.com",
    password: "admin1234",
  },
  {
    label: "QA Manager",
    role: "ADMIN",
    department: "QA",
    email: "qamanager@example.com",
    password: "qamanager123",
  },
  {
    label: "Production Manager",
    role: "ADMIN",
    department: "PRODUCTION",
    email: "productionmanager@example.com",
    password: "productionmanager123",
  },
  {
    label: "PPC Manager",
    role: "ADMIN",
    department: "PPC",
    email: "ppcmanager@example.com",
    password: "ppcmanager123",
  },
  {
    label: "Procurement Manager",
    role: "ADMIN",
    department: "PROCUREMENT",
    email: "procurementmanager@example.com",
    password: "procurementmanager123",
  },
  {
    label: "Customer 1",
    role: "USER",
    department: "CUSTOMER",
    email: "customer1@example.com",
    password: "user1234",
  },
  {
    label: "Customer 2",
    role: "USER",
    department: "CUSTOMER",
    email: "customer2@example.com",
    password: "user1234",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  function fillDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedDemo(account.email);
    setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        },
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Login gagal");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const secureFlag =
        window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `token=${encodeURIComponent(data.access_token)}; Path=/; Max-Age=86400; SameSite=Lax${secureFlag}`;

      if (data.user.role === "SUPER_ADMIN") {
        toast.success("Login berhasil!");
        setTimeout(() => {
          window.location.href = "/dashboard/superadmin";
        }, 1000);
      } else if (data.user.role === "ADMIN") {
        toast.success("Login berhasil!");
        setTimeout(() => {
          window.location.href =
            data.user.department === "SALES"
              ? "/dashboard/sales"
              : data.user.department === "QA"
                ? "/dashboard/qa"
                : data.user.department === "PRODUCTION"
                  ? "/dashboard/production"
                    : data.user.department === "PPC"
                        ? "/dashboard/ppc"
                        : data.user.department === "PROCUREMENT"
                          ? "/dashboard/procurement"
                          : "/dashboard/admin";
        }, 1000);
      } else if (data.user.role === "USER") {
        toast.success("Login berhasil!");
        setTimeout(() => {
          window.location.href = "/dashboard/user";
        }, 1000);
      } else {
        setError("Role tidak dikenali");
        toast.error("Role tidak dikenali");
      }
    } catch {
      setError("Terjadi kesalahan server");
      toast.error("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-16 text-text sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl overflow-hidden rounded-[32px] border border-border bg-surface shadow-[0_20px_60px_-20px_rgba(15,76,129,0.25)]">
        {/* Bagian kiri */}
        <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-primary to-accent p-10 text-white lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Manutics
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">
              Masuk untuk mengelola kebutuhan manufaktur Anda.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/80">
              Akses dashboard, pantau permintaan produksi, dan jalin kerja sama
              dengan tim kami.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-semibold">
              Kenapa pelanggan kami suka bekerja sama dengan kami?
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>• Produksi cepat dan konsisten</li>
              <li>• Komunikasi yang transparan</li>
              <li>• Dukungan teknis profesional</li>
            </ul>
          </div>
        </div>

        {/* Bagian kanan (form login) */}
        <div className="flex-1 p-8 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <Link
              href="/"
              className="text-sm font-semibold text-primary hover:underline"
            >
              ← Kembali ke beranda
            </Link>
            <h2 className="mt-6 text-3xl font-semibold text-text">Masuk</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Silakan masuk untuk melanjutkan ke akun Anda.
            </p>

            {/* Akun demo (simulasi login) */}
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Akun demo — klik untuk mengisi otomatis
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DEMO_ACCOUNTS.map((acc) => {
                  const active = selectedDemo === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemo(acc)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition hover:-translate-y-0.5 ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-surface text-text hover:border-primary"
                      }`}
                    >
                      <span className="block font-semibold">{acc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedDemo(null);
                  }}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSelectedDemo(null);
                    }}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm outline-none transition focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Ingat saya
                </label>
                <a
                  href="#"
                  className="font-medium text-primary hover:underline"
                >
                  Lupa password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Masuk Sekarang"}
              </button>
            </form>

            {error && (
              <p className="mt-4 text-center text-sm text-red-500">{error}</p>
            )}

            <p className="mt-6 text-center text-sm text-slate-600">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
