"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  CustomerDetail,
  CustomerOrder,
  CustomerOrderApproval,
  createSalesRecord,
  formatDate,
  getCustomerDetails,
  getCustomerOrders,
  getSavedToken,
} from "../data";

const INPUT_CLASS =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

const INTEGER_FIELDS = new Set([
  "coatingMass",
  "YS",
  "minYS",
  "maxYS",
  "TS",
  "minTS",
  "maxTS",
  "minCoilWeight",
  "maxCoilWeight",
  "totalQuantity",
]);

const RANGE_GROUPS = [
  { title: "TCT", unit: "mm", fields: ["TCT", "minTCT", "maxTCT"] },
  { title: "BMT", unit: "mm", fields: ["BMT", "minBMT", "maxBMT"] },
  { title: "Lebar", unit: "mm", fields: ["width", "minWidth", "maxWidth"] },
  { title: "Yield strength (YS)", unit: "MPa", fields: ["YS", "minYS", "maxYS"] },
  { title: "Tensile strength (TS)", unit: "MPa", fields: ["TS", "minTS", "maxTS"] },
  { title: "Elongation (EL)", unit: "%", fields: ["EL", "minEL", "maxEL"] },
];

const RANGE_PAIRS = [
  ["minTCT", "maxTCT"],
  ["minBMT", "maxBMT"],
  ["minWidth", "maxWidth"],
  ["minYS", "maxYS"],
  ["minTS", "maxTS"],
  ["minEL", "maxEL"],
  ["minCoilWeight", "maxCoilWeight"],
] as const;

const APPROVAL_DEPARTMENTS = [
  { value: "PRODUCTION", label: "Produksi", width: "130px" },
  { value: "QA", label: "QA", width: "80px" },
  { value: "PPC", label: "PPC", width: "85px" },
  { value: "PROCUREMENT", label: "Pengadaan", width: "155px" },
  { value: "SALES", label: "Sales", width: "100px" },
] as const;

const ENUM_OPTIONS: Record<string, string[]> = {
  productType: ["Revolume", "Revxium"],
  coatingType: ["Zn", "Al_Zn"],
  chemicalTreatment: ["Clear_Resin", "Tinted_Resin", "Passivation"],
  export: ["Domestik", "Export"],
  orderStatus: [
    "Pengajuan penawaran",
    "Jawaban penawaran",
    "Pemesanan",
    "Produksi",
    "Inspeksi",
    "Packing",
    "Dikirim",
    "Selesai",
    "Dibatalkan",
  ],
};

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-slate-500">{children}</p>;
}

function ApprovalStatusBadge({ status }: { status: CustomerOrderApproval["status"] }) {
  const styles =
    status === "APPROVED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "REJECTED"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";
  const labels = {
    PENDING: "Menunggu",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${styles}`}>
      {labels[status]}
    </span>
  );
}

function DepartmentApprovalCell({
  approvals,
  department,
}: {
  approvals: CustomerOrderApproval[];
  department: string;
}) {
  const departmentApprovals = approvals.filter(
    (approval) => approval.department === department,
  );

  if (departmentApprovals.length === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <ul className="space-y-1.5">
      {departmentApprovals.map((approval) => (
        <li key={approval.id}>
          <ApprovalStatusBadge status={approval.status} />
        </li>
      ))}
    </ul>
  );
}

function ApprovalList({
  approvals,
  detailed = false,
}: {
  approvals: CustomerOrderApproval[];
  detailed?: boolean;
}) {
  if (approvals.length === 0) {
    return <span className="text-xs text-slate-500">Belum ada persetujuan</span>;
  }

  return (
    <ul className={detailed ? "grid gap-2 sm:grid-cols-2 lg:grid-cols-3" : "space-y-1.5"}>
      {approvals.map((approval) => (
        <li
          key={approval.id}
          className={detailed ? "rounded-lg border border-border bg-white p-3" : "flex flex-col items-start gap-1"}
        >
          <span className="text-xs font-medium text-text">
            {approval.department} · {approval.position.replaceAll("_", " ")}
          </span>
          <ApprovalStatusBadge status={approval.status} />
          {detailed && approval.decidedBy && (
            <span className="mt-1 text-xs text-slate-500">
              Oleh {approval.decidedBy.name}
              {approval.decidedAt ? ` · ${formatDate(approval.decidedAt)}` : ""}
            </span>
          )}
          {detailed && approval.note && (
            <span className="mt-1 whitespace-pre-wrap text-xs text-slate-600">
              {approval.note}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-text">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function InputField({
  name,
  label,
  type = "number",
  unit,
  step,
}: {
  name: string;
  label: string;
  type?: "number" | "text" | "date";
  unit?: string;
  step?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {unit && <span className="ml-1 font-normal text-slate-400">({unit})</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? step ?? (INTEGER_FIELDS.has(name) ? "1" : "any") : undefined}
        className={INPUT_CLASS}
        required
      />
    </div>
  );
}

function SelectField({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select id={name} name={name} defaultValue="" className={INPUT_CLASS} required>
        <option value="" disabled>Pilih {label.toLowerCase()}</option>
        {ENUM_OPTIONS[name].map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export default function SalesCustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [customers, setCustomers] = useState<CustomerDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "ALL" || order.orderStatus === statusFilter;
      const matchesSearch =
        !query ||
        [
          order.SO,
          order.customerDetail.companyName,
          order.customerDetail.contactPerson,
          order.productName,
          order.productType,
          order.user.name,
          order.user.email,
        ].some((value) => value.toLocaleLowerCase("id-ID").includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  useEffect(() => {
    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let active = true;
    void Promise.all([getCustomerOrders(token), getCustomerDetails(token)])
      .then(([orderData, customerData]) => {
        if (active) {
          setOrders(orderData);
          setCustomers(customerData);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat data customer order.",
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const formElement = event.currentTarget;
    const values = new FormData(formElement);
    const selectedCustomer = customers.find(
      (customer) => customer.id === values.get("customerDetailId"),
    );
    if (!selectedCustomer) {
      setFormError("Pilih customer detail terlebih dahulu.");
      return;
    }

    const payload: Record<string, string | number> = {
      customerDetailId: selectedCustomer.id,
      companyName: selectedCustomer.companyName,
      companyAddress: selectedCustomer.companyAddress,
      contactPerson: selectedCustomer.contactPerson,
    };
    if (selectedCustomer.email) payload.customerEmail = selectedCustomer.email;
    if (selectedCustomer.phone) payload.customerPhone = selectedCustomer.phone;

    const fieldNames = [
      "productType",
      "coatingType",
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
      "Grade",
      "YS",
      "minYS",
      "maxYS",
      "TS",
      "minTS",
      "maxTS",
      "EL",
      "minEL",
      "maxEL",
      "chemicalTreatment",
      "minCoilWeight",
      "maxCoilWeight",
      "totalQuantity",
      "export",
      "deliveryTime",
      "orderStatus",
      "note",
    ];

    for (const name of fieldNames) {
      const value = String(values.get(name) ?? "").trim();
      if (!value && name !== "note") {
        setFormError(`Kolom ${name} wajib diisi.`);
        document.getElementById(name)?.focus();
        return;
      }
      if (INTEGER_FIELDS.has(name)) payload[name] = Number.parseInt(value, 10);
      else if ([
        "TCT", "minTCT", "maxTCT", "BMT", "minBMT", "maxBMT",
        "width", "minWidth", "maxWidth", "EL", "minEL", "maxEL",
      ].includes(name)) payload[name] = Number.parseFloat(value);
      else payload[name] = value || "-";
    }

    for (const [minName, maxName] of RANGE_PAIRS) {
      if (Number(payload[minName]) > Number(payload[maxName])) {
        setFormError(`${minName} tidak boleh lebih besar dari ${maxName}.`);
        document.getElementById(minName)?.focus();
        return;
      }
    }

    payload.deliveryTime = new Date(String(values.get("deliveryTime"))).toISOString();
    setSaving(true);
    try {
      await createSalesRecord(
        "customer-orders/sales",
        token,
        payload,
        "Gagal menambahkan customer order.",
      );
      setOrders(await getCustomerOrders(token));
      formElement.reset();
      setShowForm(false);
      setSuccess("Customer order berhasil ditambahkan.");
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Terjadi kesalahan saat menyimpan customer order.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text sm:text-3xl">Daftar Customer Order</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? "Memuat data..." : `${orders.length} order terdaftar`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((open) => !open);
            setFormError("");
            setSuccess("");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <PlusIcon className="h-5 w-5" />
          {showForm ? "Tutup Form" : "Tambah Customer Order"}
        </button>
      </header>

      {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-5">
          <Section title="Alamat Pengiriman" description="Pilih customer detail yang digunakan untuk order ini.">
            <label htmlFor="customerDetailId" className="mb-1.5 block text-sm font-medium text-slate-700">
              Customer Detail <span className="text-red-600">*</span>
            </label>
            <select id="customerDetailId" name="customerDetailId" defaultValue="" className={INPUT_CLASS} required>
              <option value="" disabled>Pilih customer detail</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.companyName} — {customer.companyAddress} ({customer.user.email})
                </option>
              ))}
            </select>
            {customers.length === 0 && !loading && (
              <p className="mt-2 text-sm text-slate-500">Tambahkan customer detail sebelum membuat order.</p>
            )}
          </Section>

          <Section title="Informasi Order" description="Data dasar order dan customer.">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField name="orderStatus" label="Status Order" />
            </div>
          </Section>

          <Section title="Produk dan Coating">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField name="productType" label="Tipe Produk" />
              <SelectField name="coatingType" label="Tipe Coating" />
              <InputField name="coatingMass" label="Coating Mass" unit="g/m²" />
              <SelectField name="chemicalTreatment" label="Chemical Treatment" />
            </div>
          </Section>

          <Section title="Dimensi" description="Isi nilai nominal, minimum, dan maksimum.">
            <div className="space-y-4">
              {RANGE_GROUPS.slice(0, 3).map((group) => (
                <fieldset key={group.title} className="rounded-lg border border-border bg-background/60 p-4">
                  <legend className="px-1 text-sm font-semibold text-text">
                    {group.title} <span className="font-normal text-slate-400">({group.unit})</span>
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {group.fields.map((name, index) => (
                      <InputField
                        key={name}
                        name={name}
                        label={["Nominal", "Min", "Max"][index]}
                      />
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </Section>

          <Section title="Sifat Mekanis">
            <div className="space-y-4">
              <div className="sm:max-w-xs">
                <InputField name="Grade" label="Grade" type="text" />
              </div>
              {RANGE_GROUPS.slice(3).map((group) => (
                <fieldset key={group.title} className="rounded-lg border border-border bg-background/60 p-4">
                  <legend className="px-1 text-sm font-semibold text-text">
                    {group.title} <span className="font-normal text-slate-400">({group.unit})</span>
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {group.fields.map((name, index) => (
                      <InputField
                        key={name}
                        name={name}
                        label={["Nominal", "Min", "Max"][index]}
                      />
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </Section>

          <Section title="Kuantitas dan Pengiriman">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField name="minCoilWeight" label="Berat Coil Min" unit="kg" />
              <InputField name="maxCoilWeight" label="Berat Coil Max" unit="kg" />
              <InputField name="totalQuantity" label="Total Quantity" unit="kg" />
              <SelectField name="export" label="Tujuan" />
              <InputField name="deliveryTime" label="Tanggal Pengiriman" type="date" />
            </div>
            <div className="mt-4">
              <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-slate-700">
                Catatan <span className="font-normal text-slate-400">(opsional)</span>
              </label>
              <textarea id="note" name="note" rows={3} className={INPUT_CLASS} />
            </div>
          </Section>

          {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || customers.length === 0}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Customer Order"}
            </button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-56 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nomor QO, customer, atau produk"
            aria-label="Cari customer order"
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter status customer order"
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="ALL">Semua status</option>
          {ENUM_OPTIONS.orderStatus.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <section
        aria-labelledby="selected-order-title"
        className="mb-6 overflow-hidden rounded-xl border border-border bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 id="selected-order-title" className="font-semibold text-text">
            Customer Order Terpilih
          </h2>
          {selectedOrder && (
            <button
              type="button"
              onClick={() => setSelectedOrderId(null)}
              aria-label="Tutup detail order"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-background hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
            <tbody className="divide-y divide-border">
              {selectedOrder ? (
                <>
                  <tr className="align-top text-slate-700">
                    <th scope="row" className="w-[12%] bg-background px-3 py-3 font-semibold text-text">Nomor QO</th>
                    <td className="w-[21%] break-words px-3 py-3">{selectedOrder.SO}</td>
                    <th scope="row" className="w-[12%] bg-background px-3 py-3 font-semibold text-text">Perusahaan</th>
                    <td className="w-[21%] break-words px-3 py-3">{selectedOrder.customerDetail.companyName}</td>
                    <th scope="row" className="w-[12%] bg-background px-3 py-3 font-semibold text-text">Contact Person</th>
                    <td className="w-[22%] break-words px-3 py-3">{selectedOrder.customerDetail.contactPerson}</td>
                  </tr>
                  <tr className="align-top text-slate-700">
                    <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Alamat Pengiriman</th>
                    <td className="whitespace-pre-wrap break-words px-3 py-3">{selectedOrder.customerDetail.companyAddress}</td>
                    <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Akun Sales</th>
                    <td className="break-words px-3 py-3">
                      <p>{selectedOrder.user.name}</p>
                      <p className="text-xs text-slate-500">{selectedOrder.user.email}</p>
                    </td>
                    <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Produk</th>
                    <td className="break-words px-3 py-3">{selectedOrder.productName}</td>
                  </tr>
                  <tr className="align-top text-slate-700">
                    <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Tipe Produk</th>
                    <td className="break-words px-3 py-3">{selectedOrder.productType}</td>
                    <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Kuantitas</th>
                    <td className="px-3 py-3">{selectedOrder.totalQuantity.toLocaleString("id-ID")} kg</td>
                    <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Tanggal Order</th>
                    <td className="px-3 py-3">{formatDate(selectedOrder.orderAt)}</td>
                  </tr>
                  <tr className="align-top text-slate-700">
                    <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Jadwal Pengiriman</th>
                    <td className="px-3 py-3">{formatDate(selectedOrder.deliveryTime)}</td>
                    <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Status</th>
                    <td colSpan={3} className="px-3 py-3">{selectedOrder.orderStatus}</td>
                  </tr>
                  <tr className="align-top text-slate-700">
                    <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Persetujuan</th>
                    <td colSpan={5} className="px-3 py-3">
                      <ApprovalList approvals={selectedOrder.approvals ?? []} detailed />
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState>Belum ada data yang dipilih.</EmptyState>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1735px] table-fixed text-left text-sm">
            <colgroup>
              <col style={{ width: "140px" }} />
              <col style={{ width: "260px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "145px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "180px" }} />
              {APPROVAL_DEPARTMENTS.map((department) => (
                <col key={department.value} style={{ width: department.width }} />
              ))}
            </colgroup>
            <thead className="bg-primary text-white">
              <tr>
                <th rowSpan={2} scope="col" className="px-4 py-3 font-semibold">Nomor QO</th>
                <th rowSpan={2} scope="col" className="px-4 py-3 font-semibold">Customer</th>
                <th rowSpan={2} scope="col" className="px-4 py-3 font-semibold">Produk</th>
                <th rowSpan={2} scope="col" className="px-4 py-3 font-semibold">Kuantitas</th>
                <th rowSpan={2} scope="col" className="px-4 py-3 font-semibold">Tanggal Order</th>
                <th rowSpan={2} scope="col" className="px-4 py-3 font-semibold">Jadwal Pengiriman</th>
                <th rowSpan={2} scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th colSpan={APPROVAL_DEPARTMENTS.length} scope="colgroup" className="px-4 py-3 text-center font-semibold">
                  Persetujuan
                </th>
              </tr>
              <tr>
                {APPROVAL_DEPARTMENTS.map((department) => (
                  <th key={department.value} scope="col" className="whitespace-normal px-3 py-3 font-semibold leading-tight">
                    {department.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7 + APPROVAL_DEPARTMENTS.length}><EmptyState>Memuat data order...</EmptyState></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7 + APPROVAL_DEPARTMENTS.length}><EmptyState>Belum ada customer order.</EmptyState></td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7 + APPROVAL_DEPARTMENTS.length}><EmptyState>Tidak ada order yang cocok dengan filter.</EmptyState></td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`align-top ${
                      selectedOrderId === order.id
                        ? "cursor-pointer bg-primary/5"
                        : "cursor-pointer hover:bg-background/70"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-text">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        aria-pressed={selectedOrderId === order.id}
                        className="text-left text-primary hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        {order.SO}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p className="font-medium text-text">{order.customerDetail.companyName}</p>
                      <p>{order.customerDetail.contactPerson}</p>
                      <p className="text-xs">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{order.productName}</p>
                      <p className="text-xs">{order.productType}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{order.totalQuantity.toLocaleString("id-ID")} kg</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(order.orderAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(order.deliveryTime)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {order.orderStatus}
                      </span>
                    </td>
                    {APPROVAL_DEPARTMENTS.map((department) => (
                      <td key={department.value} className="px-4 py-3">
                        <DepartmentApprovalCell
                          approvals={order.approvals ?? []}
                          department={department.value}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-5 py-4">
          <p className="text-sm text-slate-500">
            {loading ? "Memuat..." : `${filteredOrders.length} dari ${orders.length} order`}
          </p>
        </div>
      </section>
    </div>
  );
}
