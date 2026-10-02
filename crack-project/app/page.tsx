'use client'

import { useEffect, useState } from "react";

const benefits = [
  {
    title: "Kualitas konsisten",
    description: "Proses produksi terkontrol untuk hasil yang presisi dan andal.",
  },
  {
    title: "Skalabilitas fleksibel",
    description: "Mendukung kebutuhan produksi kecil, menengah, hingga massal.",
  },
  {
    title: "Pengiriman tepat waktu",
    description: "Tim operasional kami menjaga jadwal tetap aman dan efisien.",
  },
];

const products = [
  {
    title: "Komponen Presisi",
    description: "Solusi custom untuk industri otomotif, elektronik, dan mesin.",
    tag: "OEM",
  },
  {
    title: "Produk Manufaktur",
    description: "Spesifikasi sesuai kebutuhan dengan kontrol mutu berlapis.",
    tag: "Custom Build",
  },
  {
    title: "Layanan Prototipe",
    description: "Uji dan validasi desain sebelum produksi skala besar.",
    tag: "Rapid Prototype",
  },
];

const steps = [
  "Konsultasi kebutuhan produksi dan target kualitas",
  "Desain dan perencanaan proses yang efisien",
  "Produksi dengan kontrol mutu berkala",
  "Pengiriman lengkap dengan dukungan teknis",
];

type IntegrationUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

function formatCreatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function Home() {
  const [users, setUsers] = useState<IntegrationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        setUsers(data);
      } catch (err: unknown) {
        console.error("Error fetching users:", err);
        setError("Gagal memuat data pengguna. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="#home" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white shadow-md">
              M
            </div>
            <div>
              <p className="text-lg font-semibold text-text">Manutics</p>
              <p className="text-sm text-slate-500">Manufacturing Solutions</p>
            </div>
          </a>

          <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#about" className="transition hover:text-primary">
              Tentang Kami
            </a>
            <a href="#products" className="transition hover:text-primary">
              Produk
            </a>
            <a href="#process" className="transition hover:text-primary">
              Proses
            </a>

            <a href="#contact" className="transition hover:text-primary">
              Kontak
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
            >
              Login
            </a>
            <a
              href="/register"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Register
            </a>
          </div>
        </div>
      </header>

      <main id="home">
        <section id="integration" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <h2 className="text-3xl font-semibold text-text mb-6">Test Integrasi Users</h2>
          {loading ? (
            <p className="text-slate-600">Loading data...</p>
          ) : error ? (
            <p role="alert" className="text-sm text-red-700">{error}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-background text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Nama</th>
                    <th scope="col" className="px-4 py-3 font-medium">Email</th>
                    <th scope="col" className="px-4 py-3 font-medium">Role</th>
                    <th scope="col" className="px-4 py-3 font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-text">{user.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{user.role}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatCreatedAt(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="px-6 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                Solusi manufaktur presisi untuk bisnis Anda
              </div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Produksi berkualitas, cepat, dan andal untuk kebutuhan industri modern.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Kami membantu perusahaan membangun rantai pasok yang stabil melalui produk manufaktur custom, komponen presisi, dan layanan produksi skala besar.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#products"
                  className="rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-1"
                >
                  Lihat Produk
                </a>
                <a
                  href="#about"
                  className="rounded-full border border-border bg-surface px-6 py-3 font-semibold text-text transition hover:-translate-y-1"
                >
                  Kenapa Kami
                </a>
              </div>

              <div className="flex flex-wrap gap-6 pt-2 text-sm text-slate-600">
                <span>✓ Kualitas terjaga</span>
                <span>✓ Waktu produksi efisien</span>
                <span>✓ Dukungan teknis purna jual</span>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6 shadow-[0_20px_60px_-20px_rgba(15,76,129,0.25)]">
              <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-white">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  Production snapshot
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <div className="text-3xl font-semibold">24/7</div>
                    <p className="mt-1 text-sm text-white/80">Operational support</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <div className="text-3xl font-semibold">98%</div>
                    <p className="mt-1 text-sm text-white/80">On-time delivery</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Rapid prototyping</span>
                    <span className="text-sm text-primary">7 hari</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Mendukung uji model sebelum produksi massal.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Material premium</span>
                    <span className="text-sm text-secondary">Terjamin</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Memilih bahan dengan standar industri yang ketat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="border-y border-border bg-surface/70">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              {benefits.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <div className="mb-4 h-10 w-10 rounded-full bg-primary/10" />
                  <h3 className="text-xl font-semibold text-text">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="products" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Layanan unggulan
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-text sm:text-4xl">
                Produk dan layanan yang siap mendukung pertumbuhan Anda.
              </h2>
            </div>
            <a href="#contact" className="text-sm font-semibold text-primary">
              Konsultasi kebutuhan →
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <div key={product.title} className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                  {product.tag}
                </div>
                <h3 className="text-xl font-semibold text-text">{product.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="process" className="bg-surface">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Proses kerja
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-text sm:text-4xl">
                  Proses yang jelas, transparan, dan terukur.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Dari konsultasi hingga pengiriman, setiap tahap kami jalankan dengan fokus pada kualitas dan komunikasi yang rapi.
                </p>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-border bg-background p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="rounded-3xl bg-primary px-8 py-12 text-white shadow-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  Siap memulai proyek?
                </p>
                <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
                  Mari bangun solusi manufaktur yang tepat untuk bisnis Anda.
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:hello@mitramandiri.com"
                  className="rounded-full bg-white px-6 py-3 font-semibold text-primary transition hover:-translate-y-0.5"
                >
                  Email Kami
                </a>
                <a
                  href="tel:+62211234567"
                  className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Telepon Sekarang
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 PT Mitra Mandiri. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#home" className="transition hover:text-primary">
              Beranda
            </a>
            <a href="#products" className="transition hover:text-primary">
              Produk
            </a>
            <a href="#contact" className="transition hover:text-primary">
              Kontak
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
