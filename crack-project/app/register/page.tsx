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

      setMessage("✅ Pendaftaran berhasil. Silakan login.");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan pada server.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-16 text-text sm:px-8 lg:px-12">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm font-semibold text-primary hover:underline">
          ← Kembali ke beranda
        </Link>
        <h2 className="mt-6 text-3xl font-semibold text-text">Daftar</h2>
        <p className="mt-2 text-sm text-slate-600">
          Isi data berikut untuk membuat akun baru.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text">
              Nama lengkap
            </label>
            <input
              id="name"
              name="name"
              required
              type="text"
              placeholder="Nama Anda"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text">
              Email
            </label>
            <input
              id="email"
              name="email"
              required
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text">
              Password
            </label>
            <input
              id="password"
              name="password"
              required
              type="password"
              placeholder="Buat password"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text">
              Konfirmasi password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              required
              type="password"
              placeholder="Ulangi password"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            {isLoading ? "Mendaftarkan..." : "Buat Akun"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-slate-600">{message}</p>}

        <p className="mt-6 text-center text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
