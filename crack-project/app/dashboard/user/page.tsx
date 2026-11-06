"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  NoSymbolIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type OrderStatus = "Menunggu" | "Produksi" | "Dikirim" | "Selesai";
type InvoiceStatus = "Menunggu" | "Jatuh tempo" | "Lunas";

interface OfferTracking {
  id: string;
  SO: string;
  productName: string;
  productType: string;
  totalQuantity: number;
  orderStatus: string;
  orderAt: string;
  deliveryTime: string;
}

interface Order {
  id: string;
  date: string;
  product: string;
  qty: string;
  total: number;
  status: OrderStatus;
  step: number; // indeks tahap di TRACK_STEPS
}

interface Invoice {
  id: string;
  orderId: string;
  due: string;
  amount: number;
  status: InvoiceStatus;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";
const TRACK_STEPS = ["Dipesan", "Produksi", "QC", "Dikirim", "Diterima"];
const ORDER_FILTERS: (OrderStatus | "Semua")[] = ["Semua", "Menunggu", "Produksi", "Dikirim", "Selesai"];

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

function getSavedToken() {
  const tokenCookie = document.cookie.split("; ").find((cookie) => cookie.startsWith("token="));
  return tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;
}

function isOfferTracking(value: unknown): value is OfferTracking {
  if (typeof value !== "object" || value === null) return false;
  const order = value as Record<string, unknown>;
  return (
    typeof order.id === "string" &&
    typeof order.SO === "string" &&
    typeof order.productName === "string" &&
    typeof order.productType === "string" &&
    typeof order.totalQuantity === "number" &&
    typeof order.orderStatus === "string" &&
    typeof order.orderAt === "string" &&
    typeof order.deliveryTime === "string"
  );
}

function formatTrackingDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

const badgeStyle: Record<string, string> = {
  Menunggu: "bg-amber-50 text-amber-700",
  Produksi: "bg-blue-50 text-blue-700",
  Dikirim: "bg-blue-50 text-blue-700",
  Selesai: "bg-emerald-50 text-emerald-700",
  Lunas: "bg-emerald-50 text-emerald-700",
  "Jatuh tempo": "bg-red-50 text-red-700",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyle[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p
        className={`mt-2 font-bold text-primary ${
          typeof value === "number" ? "text-2xl" : "text-sm"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Tracker({ order }: { order: Order }) {
  return (
    <div>
      <p className="text-sm">
        <span className="font-semibold">{order.id}</span>
        <span className="text-slate-600"> · {order.product}</span>{" "}
        <Badge status={order.status} />
      </p>
      <ol className="mt-4 flex">
        {TRACK_STEPS.map((label, i) => {
          const done = i <= order.step;
          return (
            <li key={label} className="relative flex-1 text-center text-xs">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[-50%] top-[10px] h-0.5 w-full ${done ? "bg-primary" : "bg-border"}`}
                />
              )}
              <span
                className={`relative z-10 mx-auto mb-1.5 block h-[22px] w-[22px] rounded-full ${done ? "bg-primary" : "bg-border"}`}
              />
              <span className={done ? "text-text" : "text-slate-400"}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const th = "whitespace-nowrap px-3 py-2 text-center text-xs font-semibold text-slate-500";
const td = "whitespace-nowrap px-3 py-3";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export default function CustomerDashboardPage() {
  const [filter, setFilter] = useState<OrderStatus | "Semua">("Semua");
  const [orders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [toast, setToast] = useState("");
  const [offerTracking, setOfferTracking] = useState<OfferTracking[]>([]);
  const [offerTrackingLoading, setOfferTrackingLoading] = useState(true);
  const [offerTrackingError, setOfferTrackingError] = useState("");

  useEffect(() => {
    let active = true;
    const token = getSavedToken();

    if (!token) {
      window.location.assign("/login");
      return;
    }

    void fetch(`${API_URL}/customer-orders/mine`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then(async (response) => {
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message =
            typeof body === "object" &&
            body !== null &&
            "message" in body &&
            typeof body.message === "string"
              ? body.message
              : "Gagal memuat lacak penawaran.";
          throw new Error(message);
        }
        if (!Array.isArray(body) || !body.every(isOfferTracking)) {
          throw new Error("Respons data lacak penawaran tidak valid.");
        }
        if (active) setOfferTracking(body);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setOfferTrackingError(
            loadError instanceof Error ? loadError.message : "Gagal memuat lacak penawaran.",
          );
        }
      })
      .finally(() => {
        if (active) setOfferTrackingLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Sembunyikan notifikasi otomatis
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== "Selesai").length;
    const unpaid = invoices.filter((i) => i.status !== "Lunas").reduce((a, i) => a + i.amount, 0);
    const spent = orders.reduce((a, o) => a + o.total, 0);
    return { active, unpaid, spent, done: orders.length - active };
  }, [orders, invoices]);

  const offerStats = useMemo(() => {
    const statuses = offerTracking.map((offer) =>
      offer.orderStatus.trim().toLocaleLowerCase("id-ID"),
    );
    const countStatuses = (values: string[]) =>
      statuses.filter((status) => values.includes(status)).length;

    return {
      total: offerTracking.length,
      pending: countStatuses(["pending", "pengajuan penawaran"]),
      accepted: countStatuses(["diterima", "jawaban penawaran", "accepted", "approved"]),
      rejected: countStatuses(["ditolak", "rejected"]),
      cancelled: countStatuses(["dibatalkan", "cancelled", "canceled"]),
      continued: countStatuses([
        "pemesanan",
        "produksi",
        "inspeksi",
        "quality checking",
        "packing",
        "dikirim",
        "selesai",
      ]),
    };
  }, [offerTracking]);

  const activeOrders = orders.filter((o) => o.status === "Produksi" || o.status === "Dikirim");
  const visibleOrders = orders.filter((o) => filter === "Semua" || o.status === filter);

  const payInvoice = (id: string) => {
    // TODO: arahkan ke payment gateway lalu perbarui status dari respons server.
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Lunas" } : i)));
    setToast(`Pembayaran ${id} berhasil (simulasi)`);
  };

  return (
    <div className="w-full text-text">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Dashboard Pelanggan</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Pantau pesanan dan tagihan Anda di Manutics.
        </p>
      </header>

      <div className="space-y-8">
        <section aria-label="Ringkasan penawaran">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Ringkasan Penawaran</h2>
          </div>
          {offerTrackingError && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {offerTrackingError}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
            <StatCard
              label="Total penawaran"
              value={offerTrackingLoading ? "..." : offerTrackingError ? "—" : offerStats.total}
              icon={ClipboardDocumentListIcon}
            />
            <StatCard
              label="Pending"
              value={offerTrackingLoading ? "..." : offerTrackingError ? "—" : offerStats.pending}
              icon={ClockIcon}
            />
            <StatCard
              label="Diterima"
              value={offerTrackingLoading ? "..." : offerTrackingError ? "—" : offerStats.accepted}
              icon={CheckCircleIcon}
            />
            <StatCard
              label="Ditolak"
              value={offerTrackingLoading ? "..." : offerTrackingError ? "—" : offerStats.rejected}
              icon={XCircleIcon}
            />
            <StatCard
              label="Dibatalkan"
              value={offerTrackingLoading ? "..." : offerTrackingError ? "—" : offerStats.cancelled}
              icon={NoSymbolIcon}
            />
            <StatCard
              label="Lanjut ke pesanan"
              value={offerTrackingLoading ? "..." : offerTrackingError ? "—" : offerStats.continued}
              icon={ShoppingCartIcon}
            />
          </div>
        </section>

        <section aria-label="Ringkasan">
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Pesanan aktif"
              value={orders.length ? stats.active : "Belum ada data"}
              icon={CubeIcon}
            />
            <StatCard
              label="Tagihan belum dibayar"
              value={invoices.length ? rupiah(stats.unpaid) : "Belum ada data"}
              icon={ClipboardDocumentListIcon}
            />
            <StatCard
              label="Total pembelian 2026"
              value={orders.length ? rupiah(stats.spent) : "Belum ada data"}
              icon={ChartBarIcon}
            />
            <StatCard
              label="Pesanan selesai"
              value={orders.length ? stats.done : "Belum ada data"}
              icon={CheckCircleIcon}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-2">
              <section aria-labelledby="offer-tracking-title" className="mb-8">
                <h2 id="offer-tracking-title" className="mb-4 text-lg font-semibold">Lacak Penawaran</h2>
                {offerTrackingLoading ? (
                  <p className="text-sm text-slate-500">Memuat permintaan penawaran...</p>
                ) : offerTrackingError ? (
                  <p role="alert" className="text-sm text-red-600">{offerTrackingError}</p>
                ) : offerTracking.length === 0 ? (
                  <p className="text-sm text-slate-500">Belum ada permintaan penawaran.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-slate-500">
                          <th className="px-3 py-2 font-semibold">No. penawaran</th>
                          <th className="px-3 py-2 font-semibold">Produk</th>
                          <th className="px-3 py-2 font-semibold">Tanggal</th>
                          <th className="px-3 py-2 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {offerTracking.map((offer) => (
                          <tr key={offer.id} className="border-b border-border last:border-0">
                            <td className="px-3 py-3 font-medium text-text">{offer.SO}</td>
                            <td className="px-3 py-3 text-slate-600">
                              <p>{offer.productName}</p>
                              <p className="text-xs">{offer.productType} · {offer.totalQuantity.toLocaleString("id-ID")} kg</p>
                            </td>
                            <td className="px-3 py-3 text-slate-600">{formatTrackingDate(offer.orderAt)}</td>
                            <td className="px-3 py-3"><Badge status={offer.orderStatus} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              <h2 className="mb-4 text-lg font-semibold">Lacak pesanan aktif</h2>
              {activeOrders.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada pesanan yang sedang diproses atau dikirim.</p>
              ) : (
                <div className="space-y-8">
                  {activeOrders.map((o) => (
                    <Tracker key={o.id} order={o} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Aksi cepat</h2>
              <div className="grid gap-2">
                <Link href="/rfq" className={btnPrimary}>
                  Minta penawaran (RFQ)
                </Link>
                <Link href="/katalog" className={btnGhost}>
                  Lihat katalog produk
                </Link>
                <Link href="/kontak" className={btnGhost}>
                  Hubungi tim penjualan
                </Link>
              </div>
            </div>
          </div>
        </section>

      {/* Penawaran */}
        <section aria-label="Penawaran">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-1 text-lg font-semibold">Penawaran</h2>
              <p className="text-sm text-slate-600">
                Daftar permintaan penawaran dan status terkininya.
              </p>
            </div>
            <Link href="/dashboard/user/penawaran-saya" className={btnGhost}>
              Lihat semua penawaran
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-slate-500">
                  {[
                    "Nomor penawaran",
                    "Produk",
                    "Jumlah",
                    "Tanggal pengajuan",
                    "Jadwal pengiriman",
                    "Status",
                  ].map((heading) => (
                    <th key={heading} className={th}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {offerTrackingLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      Memuat penawaran...
                    </td>
                  </tr>
                ) : offerTrackingError ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-red-600">
                      {offerTrackingError}
                    </td>
                  </tr>
                ) : offerTracking.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      Belum ada penawaran.{" "}
                      <Link
                        href="/dashboard/user/rfq"
                        className="font-semibold text-primary hover:underline"
                      >
                        Buat permintaan penawaran
                      </Link>
                    </td>
                  </tr>
                ) : (
                  offerTracking.map((offer) => (
                    <tr key={offer.id} className="border-b border-border last:border-0">
                      <td className={`${td} font-medium text-text`}>{offer.SO}</td>
                      <td className="px-3 py-3 text-slate-600">
                        <p>{offer.productName}</p>
                        <p className="text-xs">
                          {offer.productType} · {offer.totalQuantity.toLocaleString("id-ID")} kg
                        </p>
                      </td>
                      <td className={td}>{offer.totalQuantity.toLocaleString("id-ID")} kg</td>
                      <td className={td}>{formatTrackingDate(offer.orderAt)}</td>
                      <td className={td}>{formatTrackingDate(offer.deliveryTime)}</td>
                      <td className={td}>
                        <Badge status={offer.orderStatus} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      {/* Pesanan */}
        <section aria-label="Pesanan">
          <h2 className="mb-1 text-lg font-semibold">Pesanan</h2>
          <p className="mb-4 text-sm text-slate-600">Riwayat dan status seluruh pesanan Anda.</p>

          <div className="mb-4 flex flex-wrap gap-2">
            {ORDER_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-full border px-4 py-1.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  filter === f
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-slate-700 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["No. pesanan", "Tanggal", "Produk", "Jumlah", "Total", "Status", ""].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                      {orders.length === 0
                        ? "Belum ada data pesanan."
                        : `Tidak ada pesanan dengan status “${filter}”.`}
                    </td>
                  </tr>
                ) : (
                  visibleOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className={`${td} font-semibold`}>{o.id}</td>
                      <td className={td}>{o.date}</td>
                      <td className={td}>{o.product}</td>
                      <td className={td}>{o.qty}</td>
                      <td className={td}>{rupiah(o.total)}</td>
                      <td className={td}>
                        <Badge status={o.status} />
                      </td>
                      <td className={td}>
                        <button
                          onClick={() => setToast(`${o.product} ditambahkan ke keranjang`)}
                          className={btnGhost}
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                          Pesan ulang
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      {/* Tagihan */}
        <section aria-label="Tagihan">
          <h2 className="mb-1 text-lg font-semibold">Tagihan</h2>
          <p className="mb-4 text-sm text-slate-600">Faktur yang perlu dan sudah dibayar.</p>

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["No. faktur", "Pesanan", "Jatuh tempo", "Nominal", "Status", ""].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-slate-500">
                      Belum ada data tagihan.
                    </td>
                  </tr>
                ) : (
                  invoices.map((i) => (
                  <tr key={i.id} className="border-b border-border last:border-0">
                    <td className={`${td} font-semibold`}>{i.id}</td>
                    <td className={td}>{i.orderId}</td>
                    <td className={td}>{i.due}</td>
                    <td className={td}>{rupiah(i.amount)}</td>
                    <td className={td}>
                      <Badge status={i.status} />
                    </td>
                    <td className={td}>
                      {i.status === "Lunas" ? (
                        <button onClick={() => setToast(`Faktur ${i.id} diunduh`)} className={btnGhost}>
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          Unduh PDF
                        </button>
                      ) : (
                        <button onClick={() => payInvoice(i.id)} className={btnPrimary}>
                          <BanknotesIcon className="h-4 w-4" />
                          Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Notifikasi */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}