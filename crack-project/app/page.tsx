"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowsPointingOutIcon,
  BeakerIcon,
  Bars3Icon,
  CheckIcon,
  Cog6ToothIcon,
  CubeIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navLinks = [
  { id: "about", label: "Tentang Kami" },
  { id: "products", label: "Produk" },
  { id: "process", label: "Proses" },
  { id: "contact", label: "Kontak" },
];

const benefits = [
  {
    title: "Kualitas konsisten",
    description: "Proses produksi terkontrol untuk hasil yang presisi dan andal.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Skalabilitas fleksibel",
    description: "Mendukung kebutuhan produksi kecil, menengah, hingga massal.",
    icon: ArrowsPointingOutIcon,
  },
  {
    title: "Pengiriman tepat waktu",
    description: "Tim operasional kami menjaga jadwal tetap aman dan efisien.",
    icon: TruckIcon,
  },
];

const products = [
  {
    title: "Komponen Presisi",
    description: "Solusi custom untuk industri otomotif, elektronik, dan mesin.",
    tag: "OEM",
    icon: Cog6ToothIcon,
  },
  {
    title: "Produk Manufaktur",
    description: "Spesifikasi sesuai kebutuhan dengan kontrol mutu berlapis.",
    tag: "Custom Build",
    icon: CubeIcon,
  },
  {
    title: "Layanan Prototipe",
    description: "Uji dan validasi desain sebelum produksi skala besar.",
    tag: "Rapid Prototype",
    icon: BeakerIcon,
  },
];

const steps = [
  "Konsultasi kebutuhan produksi dan target kualitas",
  "Desain dan perencanaan proses yang efisien",
  "Produksi dengan kontrol mutu berkala",
  "Pengiriman lengkap dengan dukungan teknis",
];

const trustPoints = ["Kualitas terjaga", "Waktu produksi efisien", "Dukungan teknis purna jual"];

// Gulir halus ke section, dengan menghormati pengaturan "kurangi gerakan"
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  // Beri bayangan pada navbar setelah halaman digulir
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tandai menu sesuai section yang sedang terlihat
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));

    const onTop = () => {
      if (window.scrollY < 200) setActiveId("");
    };
    window.addEventListener("scroll", onTop, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, []);

  // Tutup menu mobile dengan Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b bg-background/90 backdrop-blur transition-shadow ${
        scrolled ? "border-border shadow-sm" : "border-border/80"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5 lg:px-8">
        <Link
          href="/"
          onClick={() => window.scrollTo({ top: 0 })}
          className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-semibold text-white shadow-md">
            M
          </span>
          <span>
            <span className="block text-lg font-semibold leading-tight text-text">Manutics</span>
            <span className="block text-sm text-slate-500">Manufacturing Solutions</span>
          </span>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex" aria-label="Navigasi utama">
          {navLinks.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => {
                e.preventDefault();
                go(l.id);
              }}
              aria-current={activeId === l.id ? "true" : undefined}
              className={`rounded-full px-4 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                activeId === l.id
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-surface hover:text-primary"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-primary hover:text-primary sm:inline-block"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition motion-safe:hover:-translate-y-0.5 sm:inline-block"
          >
            Register
          </Link>

          {/* Tombol menu mobile */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="rounded-lg border border-border p-2 text-slate-600 transition hover:bg-surface hover:text-primary md:hidden"
          >
            {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-background px-6 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navigasi seluler">
            {navLinks.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(l.id);
                }}
                className={`rounded-lg px-3 py-3 text-sm font-medium transition ${
                  activeId === l.id
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 hover:bg-surface hover:text-primary"
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              className="rounded-full border border-border px-4 py-2.5 text-center text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      <main id="home">
        {/* Hero */}
        <section className="px-6 py-16 sm:py-20 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                Solusi manufaktur presisi untuk bisnis Anda
              </div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Produksi berkualitas, cepat, dan andal untuk kebutuhan industri modern.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">
                Kami membantu perusahaan membangun rantai pasok yang stabil melalui produk manufaktur custom,
                komponen presisi, dan layanan produksi skala besar.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("products");
                  }}
                  className="rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition motion-safe:hover:-translate-y-1"
                >
                  Lihat Produk
                </a>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("about");
                  }}
                  className="rounded-full border border-border bg-surface px-6 py-3 font-semibold text-text transition hover:border-primary hover:text-primary motion-safe:hover:-translate-y-1"
                >
                  Kenapa Kami
                </a>
              </div>

              <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-slate-600">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6 shadow-[0_20px_60px_-20px_rgba(15,76,129,0.25)]">
              <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-white">
                <p className="mb-4 text-sm font-semibold text-white/80">Ringkasan produksi</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <div className="text-3xl font-semibold">24/7</div>
                    <p className="mt-1 text-sm text-white/80">Dukungan operasional</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <div className="text-3xl font-semibold">98%</div>
                    <p className="mt-1 text-sm text-white/80">Pengiriman tepat waktu</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Rapid prototyping</span>
                    <span className="text-sm text-primary">7 hari</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Mendukung uji model sebelum produksi massal.</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Material premium</span>
                    <span className="text-sm text-secondary">Terjamin</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Memilih bahan dengan standar industri yang ketat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Keunggulan */}
        <section id="about" className="scroll-mt-20 border-y border-border bg-surface/70">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-xl font-semibold text-text">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Produk */}
        <section id="products" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-20 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Layanan unggulan</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-semibold text-text sm:text-4xl">
                Produk dan layanan yang siap mendukung pertumbuhan Anda.
              </h2>
            </div>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Konsultasi kebutuhan
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.title}
                  className="flex flex-col rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                      {product.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-text">{product.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Proses */}
        <section id="process" className="scroll-mt-20 bg-surface">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-semibold text-primary">Proses kerja</p>
                <h2 className="mt-2 text-3xl font-semibold text-text sm:text-4xl">
                  Proses yang jelas, transparan, dan terukur.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Dari konsultasi hingga pengiriman, setiap tahap kami jalankan dengan fokus pada kualitas dan
                  komunikasi yang rapi.
                </p>
              </div>

              <ol className="relative space-y-4">
                {/* Garis penghubung antar langkah */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-8 left-9 top-8 w-px bg-border"
                />
                {steps.map((step, index) => (
                  <li
                    key={step}
                    className="relative flex items-center gap-4 rounded-2xl border border-border bg-background p-4"
                  >
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white ring-4 ring-background">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-slate-700">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Kontak */}
        <section id="contact" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-20 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-accent px-8 py-12 text-white shadow-xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-white/80">Siap memulai proyek?</p>
                <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
                  Mari bangun solusi manufaktur yang tepat untuk bisnis Anda.
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:hello@mitramandiri.com"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary transition motion-safe:hover:-translate-y-0.5"
                >
                  <EnvelopeIcon className="h-5 w-5" />
                  Email Kami
                </a>
                <a
                  href="tel:+62211234567"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10 motion-safe:hover:-translate-y-0.5"
                >
                  <PhoneIcon className="h-5 w-5" />
                  Telepon Sekarang
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 Manutics. All rights reserved.</p>
          <nav className="flex gap-4" aria-label="Navigasi footer">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="transition hover:text-primary"
            >
              Beranda
            </a>
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("products");
              }}
              className="transition hover:text-primary"
            >
              Produk
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
              className="transition hover:text-primary"
            >
              Kontak
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
