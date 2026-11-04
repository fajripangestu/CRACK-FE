"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";
const INPUT_CLASS =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
type SpecificationKey =
  | "coating"
  | "chemicalTreatment"
  | "grade"
  | "tct"
  | "bmt"
  | "width"
  | "ys"
  | "ts"
  | "el"
  | "minCoilWeight"
  | "maxCoilWeight";

const INITIAL_CHECKED_SPECIFICATIONS: Record<SpecificationKey, boolean> = {
  coating: false,
  chemicalTreatment: false,
  grade: false,
  tct: false,
  bmt: false,
  width: false,
  ys: false,
  ts: false,
  el: false,
  minCoilWeight: false,
  maxCoilWeight: false,
};

interface QaOrder {
  id: string;
  SO: string;
  productName: string;
  productType: string;
  coatingType: string;
  coatingMass: number;
  TCT: number;
  minTCT: number;
  maxTCT: number;
  BMT: number;
  minBMT: number;
  maxBMT: number;
  width: number;
  minWidth: number;
  maxWidth: number;
  Grade: string;
  YS: number;
  minYS: number;
  maxYS: number;
  TS: number;
  minTS: number;
  maxTS: number;
  EL: number;
  minEL: number;
  maxEL: number;
  minCoilWeight?: number;
  maxCoilWeight?: number;
  chemicalTreatment: string;
  totalQuantity: number;
  export: string;
  orderStatus: string;
  orderAt: string;
  deliveryTime: string;
  note: string;
  customerDetail: { companyName: string };
  approval: {
    id: string;
    status: ApprovalStatus;
    note: string | null;
    decidedAt: string | null;
    decidedBy: { name: string } | null;
  } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isQaOrder(value: unknown): value is QaOrder {
  if (!isRecord(value) || !isRecord(value.customerDetail)) {
    return false;
  }
  const approval = value.approval;
  const validApproval =
    approval === null ||
    (isRecord(approval) &&
      typeof approval.id === "string" &&
      ["PENDING", "APPROVED", "REJECTED"].includes(String(approval.status)) &&
      (typeof approval.note === "string" || approval.note === null) &&
      (typeof approval.decidedAt === "string" || approval.decidedAt === null) &&
      (approval.decidedBy === null ||
        (isRecord(approval.decidedBy) && typeof approval.decidedBy.name === "string")));
  const numericFields = [
    "coatingMass",
    "TCT",
    "minTCT",
    "maxTCT",
    "BMT",
    "minBMT",
    "maxBMT",
    "width",
    "minWidth",
    "maxWidth",
    "YS",
    "minYS",
    "maxYS",
    "TS",
    "minTS",
    "maxTS",
    "EL",
    "minEL",
    "maxEL",
  ];

  return (
    validApproval &&
    numericFields.every((field) => typeof value[field] === "number") &&
    typeof value.id === "string" &&
    typeof value.SO === "string" &&
    typeof value.productName === "string" &&
    typeof value.productType === "string" &&
    typeof value.coatingType === "string" &&
    typeof value.Grade === "string" &&
    typeof value.chemicalTreatment === "string" &&
    typeof value.totalQuantity === "number" &&
    typeof value.export === "string" &&
    typeof value.orderStatus === "string" &&
    typeof value.orderAt === "string" &&
    typeof value.deliveryTime === "string" &&
    typeof value.note === "string" &&
    typeof value.customerDetail.companyName === "string" &&
    (value.minCoilWeight === undefined || typeof value.minCoilWeight === "number") &&
    (value.maxCoilWeight === undefined || typeof value.maxCoilWeight === "number")
  );
}

function getToken() {
  const cookie = document.cookie.split("; ").find((item) => item.startsWith("token="));
  return cookie ? decodeURIComponent(cookie.slice("token=".length)) : null;
}

function getErrorMessage(body: unknown, fallback: string) {
  if (isRecord(body)) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
  }
  return fallback;
}

async function fetchDepartmentOrders(
  token: string,
  department: "QA" | "PRODUCTION",
  departmentLabel: string,
): Promise<QaOrder[]> {
  const endpoint = department.toLocaleLowerCase("en-US");
  const response = await fetch(`${API_URL}/customer-orders/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(getErrorMessage(body, `Gagal memuat customer order untuk ${departmentLabel}.`));
  }
  if (!Array.isArray(body) || !body.every(isQaOrder)) {
    throw new Error(`Respons daftar customer order ${departmentLabel} tidak valid.`);
  }
  return body;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

function formatNumber(value: number, unit: string) {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

function statusLabel(status: ApprovalStatus) {
  if (status === "APPROVED") return "Disetujui";
  if (status === "REJECTED") return "Ditolak";
  return "Menunggu";
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const styles =
    status === "APPROVED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "REJECTED"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {statusLabel(status)}
    </span>
  );
}

function SpecificationCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      aria-label={`Tandai ${label} sudah diperiksa`}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
    />
  );
}

export default function DepartmentOrderApprovals({
  department,
  departmentLabel,
}: {
  department: "QA" | "PRODUCTION";
  departmentLabel: string;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<QaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<QaOrder | null>(null);
  const [note, setNote] = useState("");
  const [checkedSpecifications, setCheckedSpecifications] =
    useState(INITIAL_CHECKED_SPECIFICATIONS);
  const [saving, setSaving] = useState(false);
  const allProductSpecificationsChecked = Object.entries(checkedSpecifications)
    .filter(([key]) => key !== "minCoilWeight" && key !== "maxCoilWeight")
    .every(([, checked]) => checked);
  const allCoilWeightsChecked =
    department !== "PRODUCTION" ||
    (checkedSpecifications.minCoilWeight && checkedSpecifications.maxCoilWeight);
  const allSpecificationsChecked =
    allProductSpecificationsChecked && allCoilWeightsChecked;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let active = true;
    void fetchDepartmentOrders(token, department, departmentLabel)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : `Gagal memuat customer order untuk ${departmentLabel}.`,
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router, department, departmentLabel]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return orders.filter((order) => {
      const approvalStatus = order.approval?.status ?? "PENDING";
      const matchesStatus = statusFilter === "ALL" || approvalStatus === statusFilter;
      const matchesSearch =
        !query ||
        [
          order.SO,
          order.productName,
          order.productType,
          order.customerDetail.companyName,
        ].some((value) => value.toLocaleLowerCase("id-ID").includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const pendingCount = orders.filter(
    (order) => !order.approval || order.approval.status === "PENDING",
  ).length;
  const approvedCount = orders.filter(
    (order) => order.approval?.status === "APPROVED",
  ).length;
  const rejectedCount = orders.filter(
    (order) => order.approval?.status === "REJECTED",
  ).length;

  async function submitDecision(status: "APPROVED" | "REJECTED") {
    if (!selectedOrder || saving) return;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `${API_URL}/customer-orders/${selectedOrder.id}/${department.toLocaleLowerCase("en-US")}-approval`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, note: note.trim() || undefined }),
        },
      );
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(getErrorMessage(body, `Gagal menyimpan persetujuan ${departmentLabel}.`));
      }

      setOrders(await fetchDepartmentOrders(token, department, departmentLabel));
      setSelectedOrder(null);
      setNote("");
      setSuccess(`Persetujuan order ${selectedOrder.SO} berhasil diperbarui.`);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : `Terjadi kesalahan saat menyimpan persetujuan ${departmentLabel}.`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">
          Persetujuan Customer Order
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {loading ? "Memuat data..." : `${orders.length} order tersedia untuk ${departmentLabel}`}
        </p>
      </header>

      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Menunggu", count: pendingCount, style: "text-amber-700" },
          { label: "Disetujui", count: approvedCount, style: "text-emerald-700" },
          { label: "Ditolak", count: rejectedCount, style: "text-red-700" },
        ].map((item) => (
          <section key={item.label} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${item.style}`}>{item.count}</p>
          </section>
        ))}
      </div>

      <section className="order-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Cari order</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor order, customer, atau produk"
              className={`${INPUT_CLASS} pl-9`}
            />
          </label>
          <label>
            <span className="sr-only">Filter status persetujuan</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={INPUT_CLASS}
            >
              <option value="ALL">Semua persetujuan</option>
              <option value="PENDING">Menunggu</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-background text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">No. Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Produk</th>
                <th className="px-4 py-3 font-semibold">Jumlah</th>
                <th className="px-4 py-3 font-semibold">Tanggal Order</th>
                <th className="px-4 py-3 font-semibold">Persetujuan {departmentLabel}</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Memuat customer order...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    {orders.length === 0
                      ? "Belum ada customer order."
                      : "Tidak ada order yang cocok dengan pencarian atau filter."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const status = order.approval?.status ?? "PENDING";
                  return (
                    <tr key={order.id} className="text-slate-700">
                      <td className="px-4 py-3 font-medium text-text">{order.SO}</td>
                      <td className="px-4 py-3">
                        {order.customerDetail.companyName}
                      </td>
                      <td className="px-4 py-3">{order.productName}</td>
                      <td className="px-4 py-3">{order.totalQuantity.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">{formatDate(order.orderAt)}</td>
                      <td className="px-4 py-3"><StatusBadge status={status} /></td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNote(order.approval?.note ?? "");
                            setCheckedSpecifications(INITIAL_CHECKED_SPECIFICATIONS);
                            setError("");
                          }}
                          className="rounded-full border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                        >
                          Tinjau
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-3 text-xs text-slate-500">
          {filteredOrders.length} dari {orders.length} order
        </div>
      </section>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setSelectedOrder(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-approval-title"
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="department-approval-title" className="text-lg font-semibold text-text">
                  Tinjau Order {selectedOrder.SO}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder.customerDetail.companyName}
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup detail persetujuan"
                onClick={() => setSelectedOrder(null)}
                disabled={saving}
                className="rounded-full p-1 text-slate-500 hover:bg-background"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <section className="mt-5 rounded-xl bg-background p-4">
              <h3 className="font-semibold text-text">Informasi Order</h3>
              <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-slate-500">Nomor order</dt>
                  <dd className="mt-1 font-medium text-text">{selectedOrder.SO}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Status order</dt>
                  <dd className="mt-1 font-medium text-text">{selectedOrder.orderStatus}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tanggal order</dt>
                  <dd className="mt-1 font-medium text-text">{formatDate(selectedOrder.orderAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Jumlah order</dt>
                  <dd className="mt-1 font-medium text-text">
                    {selectedOrder.totalQuantity.toLocaleString("id-ID")} kg
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tujuan</dt>
                  <dd className="mt-1 font-medium text-text">{selectedOrder.export}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Jadwal pengiriman</dt>
                  <dd className="mt-1 font-medium text-text">{formatDate(selectedOrder.deliveryTime)}</dd>
                </div>
                {department === "PRODUCTION" && selectedOrder.minCoilWeight !== undefined && (
                  <div>
                    <dt className="text-slate-500">Berat minimum coil</dt>
                    <dd className="mt-1 flex items-center gap-2 font-medium text-text">
                      <SpecificationCheckbox
                        label="berat minimum coil"
                        checked={checkedSpecifications.minCoilWeight}
                        onChange={(checked) =>
                          setCheckedSpecifications((current) => ({
                            ...current,
                            minCoilWeight: checked,
                          }))
                        }
                      />
                      {formatNumber(selectedOrder.minCoilWeight, "kg")}
                    </dd>
                  </div>
                )}
                {department === "PRODUCTION" && selectedOrder.maxCoilWeight !== undefined && (
                  <div>
                    <dt className="text-slate-500">Berat maksimum coil</dt>
                    <dd className="mt-1 flex items-center gap-2 font-medium text-text">
                      <SpecificationCheckbox
                        label="berat maksimum coil"
                        checked={checkedSpecifications.maxCoilWeight}
                        onChange={(checked) =>
                          setCheckedSpecifications((current) => ({
                            ...current,
                            maxCoilWeight: checked,
                          }))
                        }
                      />
                      {formatNumber(selectedOrder.maxCoilWeight, "kg")}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="mt-4 rounded-xl border border-border p-4">
              <h3 className="font-semibold text-text">Spesifikasi Produk</h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedOrder.productName} · {selectedOrder.productType}
              </p>
              <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-slate-500">Coating</dt>
                  <div className="mt-1 flex items-center gap-2">
                    <label className="inline-flex shrink-0 items-center">
                      <input
                        type="checkbox"
                        aria-label="Tandai coating sudah diperiksa"
                        checked={checkedSpecifications.coating}
                        onChange={(event) =>
                          setCheckedSpecifications((current) => ({
                            ...current,
                            coating: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>
                    <dd className="font-medium text-text">
                      {selectedOrder.coatingType} · {formatNumber(selectedOrder.coatingMass, "g/m²")}
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-slate-500">Chemical treatment</dt>
                  <div className="mt-1 flex items-center gap-2">
                    <label className="inline-flex shrink-0 items-center">
                      <input
                        type="checkbox"
                        aria-label="Tandai chemical treatment sudah diperiksa"
                        checked={checkedSpecifications.chemicalTreatment}
                        onChange={(event) =>
                          setCheckedSpecifications((current) => ({
                            ...current,
                            chemicalTreatment: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>
                    <dd className="font-medium text-text">{selectedOrder.chemicalTreatment}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-slate-500">Grade</dt>
                  <div className="mt-1 flex items-center gap-2">
                    <SpecificationCheckbox
                      label="Grade"
                      checked={checkedSpecifications.grade}
                      onChange={(checked) =>
                        setCheckedSpecifications((current) => ({ ...current, grade: checked }))
                      }
                    />
                    <dd className="font-medium text-text">{selectedOrder.Grade}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-slate-500">TCT</dt>
                  <div className="mt-1 flex items-center gap-2">
                    <SpecificationCheckbox
                      label="TCT"
                      checked={checkedSpecifications.tct}
                      onChange={(checked) =>
                        setCheckedSpecifications((current) => ({ ...current, tct: checked }))
                      }
                    />
                    <dd className="font-medium text-text">
                      {formatNumber(selectedOrder.TCT, "mm")} ({formatNumber(selectedOrder.minTCT, "")} – {formatNumber(selectedOrder.maxTCT, "mm")})
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-slate-500">BMT</dt>
                  <div className="mt-1 flex items-center gap-2">
                    <SpecificationCheckbox
                      label="BMT"
                      checked={checkedSpecifications.bmt}
                      onChange={(checked) =>
                        setCheckedSpecifications((current) => ({ ...current, bmt: checked }))
                      }
                    />
                    <dd className="font-medium text-text">
                      {formatNumber(selectedOrder.BMT, "mm")} ({formatNumber(selectedOrder.minBMT, "")} – {formatNumber(selectedOrder.maxBMT, "mm")})
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-slate-500">Lebar</dt>
                  <div className="mt-1 flex items-center gap-2">
                    <SpecificationCheckbox
                      label="lebar"
                      checked={checkedSpecifications.width}
                      onChange={(checked) =>
                        setCheckedSpecifications((current) => ({ ...current, width: checked }))
                      }
                    />
                    <dd className="font-medium text-text">
                      {formatNumber(selectedOrder.width, "mm")} ({formatNumber(selectedOrder.minWidth, "")} – {formatNumber(selectedOrder.maxWidth, "mm")})
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-slate-500">Yield Strength (YS)</dt>
                  <div className="mt-1 flex items-center gap-2">
                    <SpecificationCheckbox
                      label="Yield Strength"
                      checked={checkedSpecifications.ys}
                      onChange={(checked) =>
                        setCheckedSpecifications((current) => ({ ...current, ys: checked }))
                      }
                    />
                    <dd className="font-medium text-text">
                      {formatNumber(selectedOrder.YS, "MPa")} ({formatNumber(selectedOrder.minYS, "")} – {formatNumber(selectedOrder.maxYS, "MPa")})
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-slate-500">Tensile Strength (TS)</dt>
                  <div className="mt-1 flex items-center gap-2">
                    <SpecificationCheckbox
                      label="Tensile Strength"
                      checked={checkedSpecifications.ts}
                      onChange={(checked) =>
                        setCheckedSpecifications((current) => ({ ...current, ts: checked }))
                      }
                    />
                    <dd className="font-medium text-text">
                      {formatNumber(selectedOrder.TS, "MPa")} ({formatNumber(selectedOrder.minTS, "")} – {formatNumber(selectedOrder.maxTS, "MPa")})
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-slate-500">Elongation (EL)</dt>
                  <div className="mt-1 flex items-center gap-2">
                    <SpecificationCheckbox
                      label="Elongation"
                      checked={checkedSpecifications.el}
                      onChange={(checked) =>
                        setCheckedSpecifications((current) => ({ ...current, el: checked }))
                      }
                    />
                    <dd className="font-medium text-text">
                      {formatNumber(selectedOrder.EL, "%")} ({formatNumber(selectedOrder.minEL, "")} – {formatNumber(selectedOrder.maxEL, "%")})
                    </dd>
                  </div>
                </div>
              </dl>
              <div className="mt-4 border-t border-border pt-3 text-sm">
                <p className="text-slate-500">Catatan order</p>
                <p className="mt-1 whitespace-pre-wrap font-medium text-text">
                  {selectedOrder.note || "—"}
                </p>
              </div>
            </section>

            {selectedOrder.approval?.decidedBy && (
              <p className="mt-4 text-sm text-slate-500">
                Keputusan terakhir oleh {selectedOrder.approval.decidedBy.name}
                {selectedOrder.approval.decidedAt
                  ? ` pada ${formatDate(selectedOrder.approval.decidedAt)}`
                  : ""}
              </p>
            )}

            <label htmlFor="department-approval-note" className="mt-5 block text-sm font-medium text-slate-700">
              Catatan {departmentLabel} <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <textarea
              id="department-approval-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={2000}
              rows={3}
              className={`${INPUT_CLASS} mt-1.5 resize-y`}
              placeholder="Tambahkan catatan untuk keputusan ini"
            />

            <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void submitDecision("REJECTED")}
                disabled={saving}
                className="rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              >
                Tolak
              </button>
              <button
                type="button"
                onClick={() => void submitDecision("APPROVED")}
                disabled={saving || !allSpecificationsChecked}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircleIcon className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Setujui"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
