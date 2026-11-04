"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { PlusIcon } from "@heroicons/react/24/outline";

// ---------- Opsi enum ----------
// SESUAIKAN dengan nilai enum di schema.prisma kamu
// (Product_type, Coating_type, Chemical_Treatment).
const PRODUCT_TYPES = ["Revolume", "Revxium"];
const COATING_TYPES = ["Zn", "Al_Zn"];
const CHEMICAL_TREATMENTS = ["Clear_Resin", "Tinted_Resin", "Passivation"];
const EXPORT_OPTIONS = ["Domestik", "Export"];
const ORDER_STATUSES = [
  "Pengajuan penawaran",
  "Jawaban penawaran",
  "Pemesanan",
  "Produksi",
  "Quality checking",
  "Packing",
  "Dikirim",
  "Selesai",
  "Dibatalkan",
];
const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";

function getSavedToken() {
  const tokenCookie = document.cookie.split("; ").find((cookie) => cookie.startsWith("token="));
  return tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;
}

interface CustomerDetail {
  id: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
}

interface CustomerDetailForm {
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  email: string;
  phone: string;
}

const EMPTY_CUSTOMER_DETAIL_FORM: CustomerDetailForm = {
  companyName: "",
  companyAddress: "",
  contactPerson: "",
  email: "",
  phone: "",
};

function isCustomerDetail(value: unknown): value is CustomerDetail {
  if (typeof value !== "object" || value === null) return false;
  const detail = value as Record<string, unknown>;

  return (
    typeof detail.id === "string" &&
    typeof detail.companyName === "string" &&
    typeof detail.companyAddress === "string" &&
    typeof detail.contactPerson === "string" &&
    (typeof detail.email === "string" || detail.email === null) &&
    (typeof detail.phone === "string" || detail.phone === null) &&
    typeof detail.isActive === "boolean"
  );
}

// ---------- State form (semua string agar input mudah dikontrol) ----------
const EMPTY_FORM = {
  productType: "",
  coatingType: "",
  coatingMass: "",
  TCT: "",
  minTCT: "",
  maxTCT: "",
  BMT: "",
  minBMT: "",
  maxBMT: "",
  width: "",
  minWidth: "",
  maxWidth: "",
  Grade: "",
  YS: "",
  minYS: "",
  maxYS: "",
  TS: "",
  minTS: "",
  maxTS: "",
  EL: "",
  minEL: "",
  maxEL: "",
  chemicalTreatment: "",
  minCoilWeight: "",
  maxCoilWeight: "",
  totalQuantity: "",
  export: "",
  deliveryTime: "",
  orderStatus: "Pengajuan penawaran",
  note: "",
};

type FormState = typeof EMPTY_FORM;
type FieldName = keyof FormState;
type Errors = Partial<Record<FieldName, string>>;

interface Toast {
  type: "success" | "error";
  message: string;
}

const INT_FIELDS: FieldName[] = [
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
];

const FLOAT_FIELDS: FieldName[] = [
  "TCT",
  "minTCT",
  "maxTCT",
  "BMT",
  "minBMT",
  "maxBMT",
  "width",
  "minWidth",
  "maxWidth",
  "EL",
  "minEL",
  "maxEL",
];

// Pasangan [min, max] yang harus min <= max
const RANGE_PAIRS: [FieldName, FieldName][] = [
  ["minTCT", "maxTCT"],
  ["minBMT", "maxBMT"],
  ["minWidth", "maxWidth"],
  ["minYS", "maxYS"],
  ["minTS", "maxTS"],
  ["minEL", "maxEL"],
  ["minCoilWeight", "maxCoilWeight"],
];

const LABELS: Partial<Record<FieldName, string>> = {
  productType: "Tipe produk",
  coatingType: "Tipe coating",
  coatingMass: "Coating mass",
  Grade: "Grade",
  chemicalTreatment: "Chemical treatment",
  totalQuantity: "Total quantity",
  export: "Tujuan",
  deliveryTime: "Tanggal pengiriman",
  orderStatus: "Status order",
};

const REQUIRED_FIELDS = (Object.keys(EMPTY_FORM) as FieldName[]).filter(
  (field) => field !== "note",
);

// ---------- Validasi ----------
function validate(form: FormState): Errors {
  const errors: Errors = {};

  for (const key of REQUIRED_FIELDS) {
    if (!form[key].trim()) errors[key] = "Wajib diisi.";
  }

  for (const key of [...INT_FIELDS, ...FLOAT_FIELDS]) {
    if (errors[key]) continue;
    const n = Number(form[key]);
    if (!Number.isFinite(n) || n < 0) errors[key] = "Masukkan angka yang valid.";
    else if (INT_FIELDS.includes(key) && !Number.isInteger(n)) errors[key] = "Harus bilangan bulat.";
  }

  for (const [min, max] of RANGE_PAIRS) {
    if (errors[min] || errors[max]) continue;
    if (Number(form[min]) > Number(form[max])) {
      errors[min] = "Min tidak boleh lebih besar dari max.";
    }
  }

  return errors;
}

// ---------- Komponen kecil ----------
const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
  }`;

interface FieldProps {
  name: FieldName;
  label: string;
  value: string;
  onChange: (name: FieldName, value: string) => void;
  error?: string;
  unit?: string;
  type?: "text" | "number" | "date";
  step?: string;
  placeholder?: string;
}

function Field({ name, label, value, onChange, error, unit, type = "text", step, placeholder }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {unit && <span className="ml-1 font-normal text-slate-400">({unit})</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        step={type === "number" ? step ?? "any" : undefined}
        min={type === "number" ? 0 : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClass(!!error)}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  name: FieldName;
  label: string;
  value: string;
  options: Array<string | { value: string; label: string }>;
  onChange: (name: FieldName, value: string) => void;
  error?: string;
}

function SelectField({ name, label, value, options, onChange, error }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClass(!!error)}
      >
        <option value="">Pilih {label.toLowerCase()}</option>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// Satu spesifikasi dengan 3 kolom: nominal, min, max
interface RangeGroupProps {
  title: string;
  unit: string;
  base: FieldName;
  min: FieldName;
  max: FieldName;
  form: FormState;
  errors: Errors;
  onChange: (name: FieldName, value: string) => void;
}

function RangeGroup({ title, unit, base, min, max, form, errors, onChange }: RangeGroupProps) {
  return (
    <fieldset className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-800">
        {title} <span className="font-normal text-slate-400">({unit})</span>
      </legend>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field name={base} label="Nominal" type="number" value={form[base]} error={errors[base]} onChange={onChange} />
        <Field name={min} label="Min" type="number" value={form[min]} error={errors[min]} onChange={onChange} />
        <Field name={max} label="Max" type="number" value={form[max]} error={errors[max]} onChange={onChange} />
      </div>
    </fieldset>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

// ---------- Halaman ----------
export default function TambahOrderPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [addresses, setAddresses] = useState<CustomerDetail[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<CustomerDetailForm>(EMPTY_CUSTOMER_DETAIL_FORM);
  const [savingAddress, setSavingAddress] = useState(false);
  const [createAddressError, setCreateAddressError] = useState("");

  const showToast = (type: Toast["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let active = true;

    async function loadAddresses() {
      try {
        const response = await fetch(`${API_URL}/customer-details`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const body: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            typeof body === "object" && body !== null && "message" in body &&
              typeof body.message === "string"
              ? body.message
              : "Gagal memuat alamat pengiriman.",
          );
        }
        if (!Array.isArray(body) || !body.every(isCustomerDetail)) {
          throw new Error("Respons daftar alamat pengiriman tidak valid.");
        }
        if (active) setAddresses(body);
      } catch (error) {
        if (active) {
          setAddressError(
            error instanceof Error ? error.message : "Terjadi kesalahan saat memuat alamat.",
          );
        }
      } finally {
        if (active) setAddressesLoading(false);
      }
    }

    void loadAddresses();
    return () => {
      active = false;
    };
  }, [router]);

  const handleChange = (name: FieldName, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    // Hapus error field tersebut begitu user mengetik ulang
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError(null);
  };

  const handleFillDemo = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 14);
    const localDeliveryDate = [
      deliveryDate.getFullYear(),
      String(deliveryDate.getMonth() + 1).padStart(2, "0"),
      String(deliveryDate.getDate()).padStart(2, "0"),
    ].join("-");

    setForm({
      productType: "Revolume",
      coatingType: "Zn",
      coatingMass: "150",
      TCT: "0.5",
      minTCT: "0.48",
      maxTCT: "0.52",
      BMT: "0.45",
      minBMT: "0.43",
      maxBMT: "0.47",
      width: "1000",
      minWidth: "995",
      maxWidth: "1005",
      Grade: "G550",
      YS: "550",
      minYS: "500",
      maxYS: "600",
      TS: "570",
      minTS: "550",
      maxTS: "650",
      EL: "5",
      minEL: "3",
      maxEL: "8",
      chemicalTreatment: "Clear_Resin",
      minCoilWeight: "5000",
      maxCoilWeight: "10000",
      totalQuantity: "20000",
      export: "Domestik",
      deliveryTime: localDeliveryDate,
      orderStatus: "Pengajuan penawaran",
      note: "Data demo RFQ.",
    });
    setErrors({});
    setFormError(null);

    if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
      setShowAddressForm(false);
      showToast("success", "Form RFQ demo berhasil diisi.");
      return;
    }

    setSelectedAddressId("");
    setAddressForm({
      companyName: "PT Demo Customer",
      companyAddress: "Jl. Contoh No. 123, Jakarta",
      contactPerson: "Kontak Demo",
      email: "",
      phone: "081234567890",
    });
    setShowAddressForm(true);
    showToast("success", "Form RFQ demo terisi. Simpan alamat demo sebelum mengirim.");
  };

  const handleCreateAddress = async () => {
    setCreateAddressError("");

    if (
      !addressForm.companyName.trim() ||
      !addressForm.companyAddress.trim() ||
      !addressForm.contactPerson.trim()
    ) {
      setCreateAddressError("Isi nama perusahaan, alamat, dan contact person.");
      return;
    }
    if (
      addressForm.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressForm.email.trim())
    ) {
      setCreateAddressError("Masukkan alamat email yang valid.");
      return;
    }

    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSavingAddress(true);
    try {
      const response = await fetch(`${API_URL}/customer-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: addressForm.companyName.trim(),
          companyAddress: addressForm.companyAddress.trim(),
          contactPerson: addressForm.contactPerson.trim(),
          email: addressForm.email.trim() || undefined,
          phone: addressForm.phone.trim() || undefined,
        }),
      });
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof body.message === "string"
            ? body.message
            : `Gagal menyimpan alamat (status ${response.status}).`;
        throw new Error(message);
      }
      if (!isCustomerDetail(body)) {
        throw new Error("Respons alamat yang disimpan tidak valid.");
      }

      setAddresses((current) => [body, ...current]);
      setSelectedAddressId(body.id);
      setAddressForm(EMPTY_CUSTOMER_DETAIL_FORM);
      setShowAddressForm(false);
      setFormError(null);
      showToast("success", "Alamat pengiriman berhasil ditambahkan.");
    } catch (error) {
      setCreateAddressError(
        error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan alamat.",
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getSavedToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
    if (!selectedAddress) {
      setFormError("Pilih alamat pengiriman untuk permintaan penawaran ini.");
      document.getElementById("customerDetailId")?.focus();
      return;
    }

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setFormError("Beberapa isian belum benar. Periksa kolom yang ditandai merah.");
      // Fokus ke field error pertama
      const first = (Object.keys(EMPTY_FORM) as FieldName[]).find((k) => found[k]);
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      // Ubah string -> number sesuai tipe di schema.
      const payload: Record<string, string | number> = {
        customerDetailId: selectedAddress.id,
        companyName: selectedAddress.companyName,
        companyAddress: selectedAddress.companyAddress,
        contactPerson: selectedAddress.contactPerson,
      };
      if (selectedAddress.email) payload.customerEmail = selectedAddress.email;
      if (selectedAddress.phone) payload.customerPhone = selectedAddress.phone;
      for (const key of Object.keys(form) as FieldName[]) {
        if (INT_FIELDS.includes(key)) payload[key] = parseInt(form[key], 10);
        else if (FLOAT_FIELDS.includes(key)) payload[key] = parseFloat(form[key]);
        else payload[key] = form[key].trim();
      }
      payload.deliveryTime = new Date(form.deliveryTime).toISOString();
      payload.note = form.note.trim() || "-"; // kolom note wajib di schema

      const res = await fetch(`${API_URL}/customer-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Gagal menyimpan (status ${res.status})`);
      }

      handleReset();
      showToast("success", "Order baru ditambahkan.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const common = { form, errors, onChange: handleChange };
  const f = (name: FieldName) => ({
    name,
    label: LABELS[name] ?? name,
    value: form[name],
    error: errors[name],
    onChange: handleChange,
  });

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Tambah order customer</h1>
        <p className="mt-1 text-sm text-slate-500">Semua kolom wajib diisi, kecuali catatan.</p>
        <button
          type="button"
          onClick={handleFillDemo}
          disabled={addressesLoading}
          className="mt-3 inline-flex items-center justify-center rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Isi Form dengan Data Demo
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Section title="Alamat Pengiriman" description="Pilih alamat yang digunakan untuk permintaan penawaran ini.">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Pilih alamat tersimpan atau tambahkan alamat baru.</p>
            <button
              type="button"
              onClick={() => {
                setCreateAddressError("");
                setShowAddressForm((current) => !current);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <PlusIcon className="h-4 w-4" />
              {showAddressForm ? "Tutup Form" : "Tambah Alamat Pengiriman"}
            </button>
          </div>

          {showAddressForm && (
            <div
              className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Alamat Pengiriman Baru</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="addressCompanyName" className="mb-1 block text-sm font-medium text-slate-700">
                    Nama Perusahaan <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="addressCompanyName"
                    value={addressForm.companyName}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, companyName: event.target.value }))
                    }
                    className={inputClass(false)}
                    autoComplete="organization"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="addressContactPerson" className="mb-1 block text-sm font-medium text-slate-700">
                    Contact Person <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="addressContactPerson"
                    value={addressForm.contactPerson}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, contactPerson: event.target.value }))
                    }
                    className={inputClass(false)}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="addressCompanyAddress" className="mb-1 block text-sm font-medium text-slate-700">
                    Alamat Pengiriman <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="addressCompanyAddress"
                    value={addressForm.companyAddress}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, companyAddress: event.target.value }))
                    }
                    className={`${inputClass(false)} min-h-20 resize-y`}
                    autoComplete="street-address"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="addressEmail" className="mb-1 block text-sm font-medium text-slate-700">
                    Email <span className="font-normal text-slate-400">(opsional)</span>
                  </label>
                  <input
                    id="addressEmail"
                    type="email"
                    value={addressForm.email}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, email: event.target.value }))
                    }
                    className={inputClass(false)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="addressPhone" className="mb-1 block text-sm font-medium text-slate-700">
                    Nomor Telepon <span className="font-normal text-slate-400">(opsional)</span>
                  </label>
                  <input
                    id="addressPhone"
                    type="tel"
                    value={addressForm.phone}
                    onChange={(event) =>
                      setAddressForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    className={inputClass(false)}
                    autoComplete="tel"
                  />
                </div>
              </div>
              {createAddressError && (
                <p role="alert" className="mt-3 text-sm text-red-600">{createAddressError}</p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleCreateAddress()}
                  disabled={savingAddress}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingAddress ? "Menyimpan..." : "Simpan dan Pilih Alamat"}
                </button>
              </div>
            </div>
          )}

          {addressesLoading ? (
            <p className="text-sm text-slate-500">Memuat alamat pengiriman...</p>
          ) : addressError ? (
            <p role="alert" className="text-sm text-red-600">{addressError}</p>
          ) : addresses.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Belum ada alamat pengiriman yang tersimpan.
            </p>
          ) : (
            <>
              <label htmlFor="customerDetailId" className="mb-1.5 block text-sm font-medium text-slate-700">
                Pilih alamat pengiriman <span className="text-red-600">*</span>
              </label>
              <select
                id="customerDetailId"
                name="customerDetailId"
                value={selectedAddressId}
                onChange={(event) => {
                  setSelectedAddressId(event.target.value);
                  setFormError(null);
                }}
                required
                className={inputClass(false)}
              >
                <option value="">Pilih alamat pengiriman</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.companyName} — {address.companyAddress}
                  </option>
                ))}
              </select>
              {selectedAddressId && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                  {(() => {
                    const address = addresses.find((item) => item.id === selectedAddressId);
                    if (!address) return null;
                    return (
                      <div className="space-y-1 text-slate-600">
                        <p className="font-semibold text-slate-900">{address.companyName}</p>
                        <p className="whitespace-pre-wrap">{address.companyAddress}</p>
                        <p>Contact: {address.contactPerson}</p>
                        {address.email && <p>Email: {address.email}</p>}
                        {address.phone && <p>Telepon: {address.phone}</p>}
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </Section>

        {/* Informasi order */}
        <Section title="Informasi order" description="Data dasar pesanan dan customer.">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField {...f("orderStatus")} options={ORDER_STATUSES} />
          </div>
          <div className="mt-4">
            <label htmlFor="generatedProductName" className="mb-1 block text-sm font-medium text-slate-700">
              Nama produk (otomatis)
            </label>
            <output
              id="generatedProductName"
              className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {form.BMT && form.width && form.Grade.trim() && form.coatingMass && form.chemicalTreatment
                ? `${Number(form.BMT)} mm x ${Number(form.width)} mm x ${form.Grade.trim()} x ${Number(form.coatingMass)} g/m² x ${form.chemicalTreatment}`
                : "Nama produk akan terbentuk dari BMT, lebar, grade, coating mass, dan chemical treatment."}
            </output>
          </div>
        </Section>

        {/* Produk & coating */}
        <Section title="Produk dan coating">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField {...f("productType")} options={PRODUCT_TYPES} />
            <SelectField {...f("coatingType")} options={COATING_TYPES} />
            <Field {...f("coatingMass")} type="number" step="1" unit="g/m²" />
            <SelectField {...f("chemicalTreatment")} options={CHEMICAL_TREATMENTS} />
          </div>
        </Section>

        {/* Dimensi */}
        <Section title="Dimensi" description="Isi nilai nominal beserta batas minimum dan maksimum.">
          <div className="space-y-4">
            <RangeGroup title="TCT" unit="mm" base="TCT" min="minTCT" max="maxTCT" {...common} />
            <RangeGroup title="BMT" unit="mm" base="BMT" min="minBMT" max="maxBMT" {...common} />
            <RangeGroup title="Lebar" unit="mm" base="width" min="minWidth" max="maxWidth" {...common} />
          </div>
        </Section>

        {/* Sifat mekanis */}
        <Section title="Sifat mekanis">
          <div className="space-y-4">
            <div className="sm:max-w-xs">
              <Field {...f("Grade")} placeholder="mis. G550" />
            </div>
            <RangeGroup title="Yield strength (YS)" unit="MPa" base="YS" min="minYS" max="maxYS" {...common} />
            <RangeGroup title="Tensile strength (TS)" unit="MPa" base="TS" min="minTS" max="maxTS" {...common} />
            <RangeGroup title="Elongation (EL)" unit="%" base="EL" min="minEL" max="maxEL" {...common} />
          </div>
        </Section>

        {/* Pengiriman */}
        <Section title="Kuantitas dan pengiriman">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field {...f("minCoilWeight")} label="Berat coil min" type="number" step="1" unit="kg" />
            <Field {...f("maxCoilWeight")} label="Berat coil max" type="number" step="1" unit="kg" />
            <Field {...f("totalQuantity")} type="number" step="1" unit="kg" />
            <SelectField {...f("export")} options={EXPORT_OPTIONS} />
            <Field {...f("deliveryTime")} type="date" />
          </div>

          <div className="mt-4">
            <label htmlFor="note" className="mb-1 block text-sm font-medium text-slate-700">
              Catatan <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <textarea
              id="note"
              rows={3}
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              className={inputClass(false)}
            />
          </div>
        </Section>

        {formError && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {formError}
          </p>
        )}

        {/* Aksi */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kosongkan form
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {saving ? "Menyimpan…" : "Simpan order"}
          </button>
        </div>
      </form>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}