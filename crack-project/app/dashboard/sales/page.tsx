"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  NoSymbolIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import {
  CustomerOrder,
  getCustomerOrders,
  getSavedToken,
} from "./data";

const OFFER_STATUSES = new Set(["Pengajuan penawaran", "Jawaban penawaran"]);
const ORDER_STAGES = [
  "Pemesanan",
  "Produksi",
  "Inspeksi",
  "Quality checking",
  "Packing",
  "Dikirim",
  "Selesai",
];
const ORDER_STATUSES = new Set(ORDER_STAGES);

function getQuantitySummary(records: CustomerOrder[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const month = new Date(now.getFullYear(), now.getMonth(), 1);
  const year = new Date(now.getFullYear(), 0, 1);

  return records.reduce(
    (quantity, order) => {
      const orderDate = new Date(order.orderAt);
      if (Number.isNaN(orderDate.getTime()) || orderDate > now) return quantity;

      const total = order.totalQuantity;
      if (orderDate >= today) quantity.today += total;
      if (orderDate >= month) quantity.mtd += total;
      if (orderDate >= year) quantity.ytd += total;
      quantity.ptd += total;
      return quantity;
    },
    { today: 0, mtd: 0, ytd: 0, ptd: 0 },
  );
}

function QuantitySummary({ values }: { values: ReturnType<typeof getQuantitySummary> }) {
  const periods = [
    { label: "Qty Today", value: values.today },
    { label: "Qty MTD", value: values.mtd },
    { label: "Qty YTD", value: values.ytd },
    { label: "Qty PTD (awal–terbaru)", value: values.ptd },
  ];

  return (
    <div className="mt-5">
      <h3 className="mb-3 text-sm font-medium text-slate-600">Quantity</h3>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {periods.map(({ label, value }) => (
          <SummaryCard
            key={label}
            label={label}
            value={new Intl.NumberFormat("id-ID").format(value)}
            icon={ShoppingCartIcon}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

export default function SalesDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let active = true;
    void getCustomerOrders(token)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat data penawaran dan pesanan.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const summary = useMemo(() => {
    const offers = orders.filter(
      (order) =>
        OFFER_STATUSES.has(order.orderStatus) ||
        order.orderStatus === "Ditolak" ||
        order.orderStatus === "Dibatalkan",
    );
    const orderRecords = orders.filter((order) => ORDER_STATUSES.has(order.orderStatus));
    const countOffers = (status: string) =>
      offers.filter((order) => order.orderStatus === status).length;
    const countOrders = (status: string) =>
      orderRecords.filter((order) => order.orderStatus === status).length;

    return {
      offers: {
        total: offers.length,
        pending: countOffers("Pengajuan penawaran"),
        accepted: countOffers("Jawaban penawaran"),
        rejected: countOffers("Ditolak"),
        cancelled: countOffers("Dibatalkan"),
        converted: orderRecords.length,
        quantity: getQuantitySummary(offers),
      },
      orders: {
        total: orderRecords.length,
        stages: ORDER_STAGES.map((status) => ({
          status,
          count: countOrders(status),
        })),
        quantity: getQuantitySummary(orderRecords),
      },
    };
  }, [orders]);

  return (
    <div className="w-full">
      <header className="mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text sm:text-3xl">Dashboard Sales</h1>
          <p className="mt-2 text-sm text-slate-600">
            Pantau seluruh penawaran dan pesanan customer.
          </p>
        </div>
      </header>

      <section aria-label="Ringkasan penawaran" className="mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Penawaran</h2>
        </div>
        {error ? (
          <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <SummaryCard
            label="Total penawaran"
            value={loading ? "..." : error ? "—" : summary.offers.total}
            icon={ClipboardDocumentListIcon}
          />
          <SummaryCard
            label="Penawaran pending"
            value={loading ? "..." : error ? "—" : summary.offers.pending}
            icon={ClockIcon}
          />
          <SummaryCard
            label="Penawaran diterima"
            value={loading ? "..." : error ? "—" : summary.offers.accepted}
            icon={ShoppingCartIcon}
          />
          <SummaryCard
            label="Penawaran ditolak"
            value={loading ? "..." : error ? "—" : summary.offers.rejected}
            icon={NoSymbolIcon}
          />
          <SummaryCard
            label="Penawaran dibatalkan"
            value={loading ? "..." : error ? "—" : summary.offers.cancelled}
            icon={NoSymbolIcon}
          />
          <SummaryCard
            label="Lanjut ke pemesanan"
            value={loading ? "..." : error ? "—" : summary.offers.converted}
            icon={CheckCircleIcon}
          />
        </div>
        <QuantitySummary values={summary.offers.quantity} />
      </section>

      <section aria-label="Ringkasan pemesanan" className="mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Pemesanan</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
          <SummaryCard
            label="Total pemesanan"
            value={loading ? "..." : error ? "—" : summary.orders.total}
            icon={ClipboardDocumentListIcon}
          />
          {summary.orders.stages.map(({ status, count }) => (
            <SummaryCard
              key={status}
              label={`Status ${status.toLocaleLowerCase("id-ID")}`}
              value={loading ? "..." : error ? "—" : count}
              icon={status === "Selesai" ? CheckCircleIcon : ShoppingCartIcon}
            />
          ))}
        </div>
        <QuantitySummary values={summary.orders.quantity} />
      </section>

    </div>
  );
}
