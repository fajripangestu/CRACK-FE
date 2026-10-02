"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email || !password) {
      setMessage("Semua field wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Konfirmasi password tidak sama.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Pendaftaran gagal. Silakan coba lagi.");
      }

      setMessage("Pendaftaran berhasil. Silakan masuk ke akun Anda.");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan pada server.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100svh] items-center overflow-y-auto bg-background px-4 py-3 text-text sm:px-8 sm:py-4 lg:px-12 lg:py-6">
      <div className="mx-auto flex max-w-6xl overflow-hidden rounded-[32px] border border-border bg-surface shadow-[0_20px_60px_-20px_rgba(15,76,129,0.25)]">
        <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-secondary to-primary p-8 text-white lg:flex xl:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Daftar akun
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">
              Buat akun bisnis Anda dan mulai kolaborasi produksi.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/80">
              Dapatkan akses cepat untuk konsultasi, penawaran, dan pengelolaan proyek manufaktur Anda.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-semibold">Apa yang Anda dapatkan?</p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>• Informasi produk terbaru</li>
              <li>• Penawaran khusus untuk mitra</li>
              <li>• Dukungan tim industri yang cepat</li>
            </ul>
          </div>
        </div>

        <div className="flex-1 p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <Link href="/" className="text-sm font-semibold text-primary hover:underline">
              ← Kembali ke beranda
            </Link>
            <h2 className="mt-4 text-3xl font-semibold text-text">Daftar</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Isi data berikut untuk membuat akun baru.
            </p>

            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-text">
                  Nama lengkap
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  type="text"
                  placeholder="Nama Anda"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-text">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  required
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-text">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  required
                  type="password"
                  placeholder="Buat password"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-text">
                  Konfirmasi password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  type="password"
                  placeholder="Ulangi password"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Mendaftarkan..." : "Buat Akun"}
              </button>
            </form>

            {message && (
              <p role="status" className="mt-3 text-center text-sm text-slate-600">
                {message}
              </p>
            )}

            <p className="mt-4 text-center text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
