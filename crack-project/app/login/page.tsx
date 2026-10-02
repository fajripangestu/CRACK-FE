"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("🔎 Mengirim login request:", { email, password });

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("📩 Response status:", res.status);

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Error response:", err);
        setError(err.message || "Login gagal");
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("✅ Login berhasil, data:", data);

      localStorage.setItem("token", data.access_token);
      alert("Login berhasil!");
      window.location.href = "/dashboard"; // redirect setelah login
    } catch (err) {
      console.error("🔥 Catch error:", err);
      setError("Terjadi kesalahan server");
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
              Akses dashboard, pantau permintaan produksi, dan jalin kerja sama dengan tim kami.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-semibold">Kenapa pelanggan kami suka bekerja sama dengan kami?</p>
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
            <Link href="/" className="text-sm font-semibold text-primary hover:underline">
              ← Kembali ke beranda
            </Link>
            <h2 className="mt-6 text-3xl font-semibold text-text">Masuk</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Silakan masuk untuk melanjutkan ke akun Anda.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-text">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-text">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  Ingat saya
                </label>
                <a href="#" className="font-medium text-primary hover:underline">
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

            {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

            <p className="mt-6 text-center text-sm text-slate-600">
              Belum punya akun?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
