"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Offer {
  id: string;
  SO: string;
  productName: string;
  productType: string;
  totalQuantity: number;
  orderStatus: string;
  orderAt: string;
  deliveryTime: string;
  customerDetailId: string;
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
  chemicalTreatment: string;
  minCoilWeight: number;
  maxCoilWeight: number;
  export: string;
  note: string;
  customerDetail: CustomerAddress;
}

interface CustomerAddress {
  id: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";
const OFFER_STATUSES = [
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
const CANCELLABLE_OFFER_STATUSES = [
  "Pengajuan penawaran",
  "Jawaban penawaran",
  "Pemesanan",
];
const EDIT_FIELDS = [
  { name: "productType", label: "Tipe Produk", type: "select", options: ["Revolume", "Revxium"] },
  { name: "coatingType", label: "Tipe Coating", type: "select", options: ["Zn", "Al_Zn"] },
  { name: "coatingMass", label: "Coating Mass (g/m²)", type: "number" },
  { name: "TCT", label: "TCT Nominal (mm)", type: "number" },
  { name: "minTCT", label: "TCT Minimum (mm)", type: "number" },
  { name: "maxTCT", label: "TCT Maksimum (mm)", type: "number" },
  { name: "BMT", label: "BMT Nominal (mm)", type: "number" },
  { name: "minBMT", label: "BMT Minimum (mm)", type: "number" },
  { name: "maxBMT", label: "BMT Maksimum (mm)", type: "number" },
  { name: "width", label: "Lebar Nominal (mm)", type: "number" },
  { name: "minWidth", label: "Lebar Minimum (mm)", type: "number" },
  { name: "maxWidth", label: "Lebar Maksimum (mm)", type: "number" },
  { name: "Grade", label: "Grade", type: "text" },
  { name: "YS", label: "YS Nominal (MPa)", type: "number" },
  { name: "minYS", label: "YS Minimum (MPa)", type: "number" },
  { name: "maxYS", label: "YS Maksimum (MPa)", type: "number" },
  { name: "TS", label: "TS Nominal (MPa)", type: "number" },
  { name: "minTS", label: "TS Minimum (MPa)", type: "number" },
  { name: "maxTS", label: "TS Maksimum (MPa)", type: "number" },
  { name: "EL", label: "EL Nominal (%)", type: "number" },
  { name: "minEL", label: "EL Minimum (%)", type: "number" },
  { name: "maxEL", label: "EL Maksimum (%)", type: "number" },
  {
    name: "chemicalTreatment",
    label: "Chemical Treatment",
    type: "select",
    options: ["Clear_Resin", "Tinted_Resin", "Passivation"],
  },
  { name: "minCoilWeight", label: "Berat Coil Minimum (kg)", type: "number" },
  { name: "maxCoilWeight", label: "Berat Coil Maksimum (kg)", type: "number" },
  { name: "totalQuantity", label: "Jumlah Total (kg)", type: "number" },
  { name: "export", label: "Tujuan", type: "select", options: ["Domestik", "Export"] },
  { name: "deliveryTime", label: "Jadwal Pengiriman", type: "date" },
  { name: "note", label: "Catatan", type: "text" },
] as const;
type EditableField = (typeof EDIT_FIELDS)[number]["name"];
type EditForm = Record<EditableField, string> & { customerDetailId: string };
const INTEGER_FIELDS = new Set([
  "coatingMass", "YS", "minYS", "maxYS", "TS", "minTS", "maxTS",
  "minCoilWeight", "maxCoilWeight", "totalQuantity",
]);
const RANGE_PAIRS = [
  ["minTCT", "maxTCT"], ["minBMT", "maxBMT"], ["minWidth", "maxWidth"],
  ["minYS", "maxYS"], ["minTS", "maxTS"], ["minEL", "maxEL"],
  ["minCoilWeight", "maxCoilWeight"],
] as const;
const INPUT_CLASS =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function isCustomerAddress(value: unknown): value is CustomerAddress {
  if (typeof value !== "object" || value === null) return false;
  const address = value as Record<string, unknown>;
  return (
    typeof address.id === "string" &&
    typeof address.companyName === "string" &&
    typeof address.companyAddress === "string" &&
    typeof address.contactPerson === "string" &&
    (typeof address.email === "string" || address.email === null) &&
    (typeof address.phone === "string" || address.phone === null)
  );
}

function dateInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toEditForm(offer: Offer): EditForm {
  return {
    customerDetailId: offer.customerDetailId,
    productType: offer.productType,
    coatingType: offer.coatingType,
    coatingMass: String(offer.coatingMass),
    TCT: String(offer.TCT),
    minTCT: String(offer.minTCT),
    maxTCT: String(offer.maxTCT),
    BMT: String(offer.BMT),
    minBMT: String(offer.minBMT),
    maxBMT: String(offer.maxBMT),
    width: String(offer.width),
    minWidth: String(offer.minWidth),
    maxWidth: String(offer.maxWidth),
    Grade: offer.Grade,
    YS: String(offer.YS),
    minYS: String(offer.minYS),
    maxYS: String(offer.maxYS),
    TS: String(offer.TS),
    minTS: String(offer.minTS),
    maxTS: String(offer.maxTS),
    EL: String(offer.EL),
    minEL: String(offer.minEL),
    maxEL: String(offer.maxEL),
    chemicalTreatment: offer.chemicalTreatment,
    minCoilWeight: String(offer.minCoilWeight),
    maxCoilWeight: String(offer.maxCoilWeight),
    totalQuantity: String(offer.totalQuantity),
    export: offer.export,
    deliveryTime: dateInputValue(offer.deliveryTime),
    note: offer.note,
  };
}

function isOffer(value: unknown): value is Offer {
  if (typeof value !== "object" || value === null) return false;
  const offer = value as Record<string, unknown>;
  if (!isCustomerAddress(offer.customerDetail)) return false;
  return (
    typeof offer.id === "string" &&
    typeof offer.SO === "string" &&
    typeof offer.productName === "string" &&
    typeof offer.productType === "string" &&
    typeof offer.totalQuantity === "number" &&
    typeof offer.orderStatus === "string" &&
    typeof offer.orderAt === "string" &&
    typeof offer.deliveryTime === "string" &&
    typeof offer.customerDetailId === "string" &&
    typeof offer.coatingType === "string" &&
    typeof offer.coatingMass === "number" &&
    typeof offer.TCT === "number" &&
    typeof offer.minTCT === "number" &&
    typeof offer.maxTCT === "number" &&
    typeof offer.BMT === "number" &&
    typeof offer.minBMT === "number" &&
    typeof offer.maxBMT === "number" &&
    typeof offer.width === "number" &&
    typeof offer.minWidth === "number" &&
    typeof offer.maxWidth === "number" &&
    typeof offer.Grade === "string" &&
    typeof offer.YS === "number" &&
    typeof offer.minYS === "number" &&
    typeof offer.maxYS === "number" &&
    typeof offer.TS === "number" &&
    typeof offer.minTS === "number" &&
    typeof offer.maxTS === "number" &&
    typeof offer.EL === "number" &&
    typeof offer.minEL === "number" &&
    typeof offer.maxEL === "number" &&
    typeof offer.chemicalTreatment === "string" &&
    typeof offer.minCoilWeight === "number" &&
    typeof offer.maxCoilWeight === "number" &&
    typeof offer.export === "string" &&
    typeof offer.note === "string"
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

export default function MyOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingOfferId, setCancelingOfferId] = useState<string | null>(null);
  const [offerToCancel, setOfferToCancel] = useState<Offer | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [initialEditForm, setInitialEditForm] = useState<EditForm | null>(null);
  const [pendingEditPayload, setPendingEditPayload] = useState<Record<string, string | number> | null>(null);
  const [confirmEditSave, setConfirmEditSave] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editValidationError, setEditValidationError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId) ?? null;
  const editHasChanges =
    editForm !== null &&
    initialEditForm !== null &&
    JSON.stringify(editForm) !== JSON.stringify(initialEditForm);
  const filteredOffers = offers.filter((offer) => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    const matchesSearch =
      !query ||
      [offer.SO, offer.productName, offer.productType, offer.orderStatus]
        .some((value) => value.toLocaleLowerCase("id-ID").includes(query));
    const matchesStatus = statusFilter === "ALL" || offer.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function selectOffer(offerId: string) {
    if (editingOfferId) cancelEditingOffer();
    setSelectedOfferId(offerId);
  }

  useEffect(() => {
    let active = true;
    const tokenCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("token="));
    const token = tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;

    if (!token) {
      router.replace("/login");
      return () => {
        active = false;
      };
    }

    void Promise.all([
      fetch(`${API_URL}/customer-orders/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${API_URL}/customer-details`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ])
      .then(async ([offersResponse, addressesResponse]) => {
        const [offersBody, addressesBody]: [unknown, unknown] = await Promise.all([
          offersResponse.json().catch(() => null),
          addressesResponse.json().catch(() => null),
        ]);
        if (!offersResponse.ok || !addressesResponse.ok) {
          const body = !offersResponse.ok ? offersBody : addressesBody;
          const message =
            typeof body === "object" &&
            body !== null &&
            "message" in body &&
            typeof body.message === "string"
              ? body.message
              : "Gagal memuat data penawaran.";
          throw new Error(message);
        }
        if (!Array.isArray(offersBody) || !offersBody.every(isOffer)) {
          throw new Error("Respons data penawaran tidak valid.");
        }
        if (!Array.isArray(addressesBody) || !addressesBody.every(isCustomerAddress)) {
          throw new Error("Respons daftar alamat pengiriman tidak valid.");
        }
        if (active) {
          setOffers(offersBody);
          setAddresses(addressesBody);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Gagal memuat penawaran.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  function startEditingOffer(offer: Offer) {
    if (!CANCELLABLE_OFFER_STATUSES.includes(offer.orderStatus)) return;
    const form = toEditForm(offer);
    setEditingOfferId(offer.id);
    setEditForm(form);
    setInitialEditForm(form);
    setEditValidationError("");
    setError("");
  }

  function cancelEditingOffer() {
    setEditingOfferId(null);
    setEditForm(null);
    setInitialEditForm(null);
    setPendingEditPayload(null);
    setConfirmEditSave(false);
    setEditValidationError("");
  }

  function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOffer || !editForm || !editHasChanges) return;

    const selectedAddress = addresses.find(
      (address) => address.id === editForm.customerDetailId,
    );
    if (!selectedAddress) {
      setEditValidationError("Pilih alamat pengiriman yang valid.");
      return;
    }

    const payload: Record<string, string | number> = {
      customerDetailId: selectedAddress.id,
      companyName: selectedAddress.companyName,
      companyAddress: selectedAddress.companyAddress,
      contactPerson: selectedAddress.contactPerson,
      orderStatus: selectedOffer.orderStatus,
    };
    if (selectedAddress.email) payload.customerEmail = selectedAddress.email;
    if (selectedAddress.phone) payload.customerPhone = selectedAddress.phone;

    for (const field of EDIT_FIELDS) {
      const value = editForm[field.name].trim();
      if (field.name === "note") {
        payload.note = value || "-";
      } else if (field.name === "deliveryTime") {
        payload.deliveryTime = new Date(`${value}T00:00:00`).toISOString();
      } else if (field.type === "number") {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0) {
          setEditValidationError(`${field.label}: masukkan angka yang valid.`);
          return;
        }
        if (INTEGER_FIELDS.has(field.name) && !Number.isInteger(number)) {
          setEditValidationError(`${field.label}: nilai harus bilangan bulat.`);
          return;
        }
        payload[field.name] = number;
      } else {
        payload[field.name] = value;
      }
    }

    for (const [minimum, maximum] of RANGE_PAIRS) {
      if (Number(payload[minimum]) > Number(payload[maximum])) {
        setEditValidationError(`${minimum} tidak boleh lebih besar dari ${maximum}.`);
        return;
      }
    }

    setEditValidationError("");
    setPendingEditPayload(payload);
    setConfirmEditSave(true);
  }

  async function confirmSaveEdit() {
    if (!selectedOffer || !pendingEditPayload || savingEdit) return;

    const tokenCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("token="));
    const token = tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    setSavingEdit(true);
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/customer-orders/${encodeURIComponent(selectedOffer.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(pendingEditPayload),
        },
      );
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof body.message === "string"
            ? body.message
            : "Gagal menyimpan perubahan penawaran.";
        throw new Error(message);
      }
      if (!isOffer(body)) throw new Error("Respons penawaran yang diperbarui tidak valid.");

      setOffers((current) => current.map((offer) => (offer.id === body.id ? body : offer)));
      setConfirmEditSave(false);
      cancelEditingOffer();
    } catch (saveError: unknown) {
      setConfirmEditSave(false);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal menyimpan perubahan penawaran.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleCancelOffer(offer: Offer) {
    if (!CANCELLABLE_OFFER_STATUSES.includes(offer.orderStatus) || cancelingOfferId) return;

    const tokenCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("token="));
    const token = tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    setError("");
    setCancelingOfferId(offer.id);
    try {
      const response = await fetch(`${API_URL}/customer-orders/${encodeURIComponent(offer.id)}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof body.message === "string"
            ? body.message
            : "Gagal membatalkan penawaran.";
        throw new Error(message);
      }
      setOffers((current) =>
        current.map((item) =>
          item.id === offer.id ? { ...item, orderStatus: "Dibatalkan" } : item,
        ),
      );
      setOfferToCancel(null);
    } catch (cancelError: unknown) {
      setError(
        cancelError instanceof Error ? cancelError.message : "Gagal membatalkan penawaran.",
      );
    } finally {
      setCancelingOfferId(null);
    }
  }

  return (
    <div className="w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Penawaran Saya</h1>
        <p className="mt-1 text-sm text-slate-500">
          Daftar permintaan penawaran yang telah Anda buat.
        </p>
      </header>

      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-56 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nomor penawaran atau produk"
            aria-label="Cari penawaran"
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter status penawaran"
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="ALL">Semua status</option>
          {OFFER_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <section
        aria-labelledby="selected-offer-title"
        className="mb-6 overflow-hidden rounded-xl border border-border bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 id="selected-offer-title" className="font-semibold text-text">
            Penawaran Terpilih
          </h2>
          <div className="flex items-center gap-2">
            {selectedOffer && (
              <button
                type="button"
                onClick={() => {
                  if (editingOfferId) cancelEditingOffer();
                  setSelectedOfferId(null);
                }}
                aria-label="Tutup detail penawaran"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-background hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        {selectedOffer && editingOfferId === selectedOffer.id && editForm ? (
          <form onSubmit={handleEditSubmit} className="space-y-5 p-5">
            <section className="rounded-xl border border-border bg-white p-4">
              <h3 className="mb-3 font-semibold text-text">Alamat Pengiriman</h3>
              <label htmlFor="edit-customer-detail" className="mb-1.5 block text-sm font-medium text-text">
                Pilih alamat <span className="text-red-600">*</span>
              </label>
              <select
                id="edit-customer-detail"
                required
                value={editForm.customerDetailId}
                onChange={(event) =>
                  setEditForm((current) =>
                    current ? { ...current, customerDetailId: event.target.value } : current,
                  )
                }
                className={INPUT_CLASS}
              >
                <option value="">Pilih alamat pengiriman</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.companyName} — {address.companyAddress}
                  </option>
                ))}
              </select>
              {addresses.find((address) => address.id === editForm.customerDetailId) && (
                <p className="mt-2 text-sm text-slate-500">
                  Contact: {addresses.find((address) => address.id === editForm.customerDetailId)?.contactPerson}
                </p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-white p-4">
              <h3 className="mb-3 font-semibold text-text">Informasi RFQ</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {EDIT_FIELDS.map((field) => (
                  <div key={field.name} className={field.name === "note" ? "sm:col-span-2 lg:col-span-3" : ""}>
                    <label htmlFor={`edit-${field.name}`} className="mb-1.5 block text-sm font-medium text-text">
                      {field.label}
                      {field.name !== "note" && <span className="ml-1 text-red-600">*</span>}
                    </label>
                    {field.type === "select" ? (
                      <select
                        id={`edit-${field.name}`}
                        required
                        value={editForm[field.name]}
                        onChange={(event) =>
                          setEditForm((current) =>
                            current ? { ...current, [field.name]: event.target.value } : current,
                          )
                        }
                        className={INPUT_CLASS}
                      >
                        <option value="">Pilih {field.label.toLocaleLowerCase("id-ID")}</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.name === "note" ? (
                      <textarea
                        id={`edit-${field.name}`}
                        rows={3}
                        value={editForm[field.name]}
                        onChange={(event) =>
                          setEditForm((current) =>
                            current ? { ...current, [field.name]: event.target.value } : current,
                          )
                        }
                        className={INPUT_CLASS}
                      />
                    ) : (
                      <input
                        id={`edit-${field.name}`}
                        type={field.type}
                        min={field.type === "number" ? 0 : undefined}
                        step={field.type === "number" ? (INTEGER_FIELDS.has(field.name) ? 1 : "any") : undefined}
                        required
                        value={editForm[field.name]}
                        onChange={(event) =>
                          setEditForm((current) =>
                            current ? { ...current, [field.name]: event.target.value } : current,
                          )
                        }
                        className={INPUT_CLASS}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>

            {editValidationError && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {editValidationError}
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelEditingOffer}
                disabled={savingEdit}
                className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-background disabled:opacity-50"
              >
                Batal Edit
              </button>
              <button
                type="submit"
                disabled={!editHasChanges || savingEdit}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          </form>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] table-fixed text-left text-sm">
              <tbody className="divide-y divide-border">
                {selectedOffer ? (
                  <>
                    <tr className="align-top text-slate-700">
                      <th scope="row" className="w-[12%] bg-background px-3 py-3 font-semibold text-text">Nomor Penawaran</th>
                      <td className="w-[21%] break-words px-3 py-3">{selectedOffer.SO}</td>
                      <th scope="row" className="w-[12%] bg-background px-3 py-3 font-semibold text-text">Produk</th>
                      <td className="w-[21%] break-words px-3 py-3">{selectedOffer.productName}</td>
                      <th scope="row" className="w-[12%] bg-background px-3 py-3 font-semibold text-text">Tipe Produk</th>
                      <td className="w-[22%] break-words px-3 py-3">{selectedOffer.productType}</td>
                    </tr>
                    <tr className="align-top text-slate-700">
                      <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Jumlah</th>
                      <td className="px-3 py-3">{selectedOffer.totalQuantity.toLocaleString("id-ID")} kg</td>
                      <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Tanggal Pengajuan</th>
                      <td className="px-3 py-3">{formatDate(selectedOffer.orderAt)}</td>
                      <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Jadwal Pengiriman</th>
                      <td className="px-3 py-3">{formatDate(selectedOffer.deliveryTime)}</td>
                    </tr>
                    <tr className="align-top text-slate-700">
                      <th scope="row" className="bg-background px-3 py-3 font-semibold text-text">Status</th>
                      <td colSpan={5} className="px-3 py-3">{selectedOffer.orderStatus}</td>
                    </tr>
                    {CANCELLABLE_OFFER_STATUSES.includes(selectedOffer.orderStatus) ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEditingOffer(selectedOffer)}
                              disabled={cancelingOfferId !== null}
                              className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setOfferToCancel(selectedOffer)}
                              disabled={cancelingOfferId !== null}
                              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Batal
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : selectedOffer.orderStatus !== "Dibatalkan" ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-sm text-slate-500">
                          Penawaran tidak dapat dibatalkan atau diedit setelah masuk tahap produksi.
                        </td>
                      </tr>
                    ) : null}
                  </>
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                      Belum ada data yang dipilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Nomor Penawaran</th>
                <th className="px-4 py-3 font-semibold">Produk</th>
                <th className="px-4 py-3 font-semibold">Jumlah</th>
                <th className="px-4 py-3 font-semibold">Tanggal Pengajuan</th>
                <th className="px-4 py-3 font-semibold">Jadwal Pengiriman</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    Memuat penawaran...
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    Anda belum membuat penawaran.
                  </td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    Tidak ada penawaran yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                  <tr
                    key={offer.id}
                    onClick={() => selectOffer(offer.id)}
                    className={`cursor-pointer align-top ${
                      selectedOfferId === offer.id ? "bg-primary/5" : "hover:bg-background/70"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-text">
                      <button
                        type="button"
                        onClick={() => selectOffer(offer.id)}
                        aria-pressed={selectedOfferId === offer.id}
                        className="text-left text-primary hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        {offer.SO}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{offer.productName}</p>
                      <p className="text-xs">{offer.productType}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {offer.totalQuantity.toLocaleString("id-ID")} kg
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(offer.orderAt)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(offer.deliveryTime)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {offer.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && (
          <div className="border-t border-border px-5 py-4">
            <p className="text-sm text-slate-500">
              {filteredOffers.length} dari {offers.length} penawaran
            </p>
          </div>
        )}
      </section>
      {offerToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && cancelingOfferId === null) {
              setOfferToCancel(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-offer-title"
            aria-describedby="cancel-offer-description"
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
          >
            <h2 id="cancel-offer-title" className="text-lg font-semibold text-text">
              Konfirmasi Pembatalan
            </h2>
            <p id="cancel-offer-description" className="mt-2 text-sm leading-6 text-slate-600">
              Apakah Anda yakin ingin membatalkan penawaran{" "}
              <span className="font-semibold text-text">{offerToCancel.SO}</span>? Tindakan ini
              akan mengubah status menjadi Dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOfferToCancel(null)}
                disabled={cancelingOfferId !== null}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => void handleCancelOffer(offerToCancel)}
                disabled={cancelingOfferId !== null}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelingOfferId === offerToCancel.id ? "Membatalkan..." : "Ya, Batalkan"}
              </button>
            </div>
          </section>
        </div>
      )}
      {confirmEditSave && selectedOffer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingEdit) {
              setConfirmEditSave(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-offer-title"
            aria-describedby="save-offer-description"
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
          >
            <h2 id="save-offer-title" className="text-lg font-semibold text-text">
              Konfirmasi Perubahan
            </h2>
            <p id="save-offer-description" className="mt-2 text-sm leading-6 text-slate-600">
              Simpan perubahan untuk penawaran{" "}
              <span className="font-semibold text-text">{selectedOffer.SO}</span>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmEditSave(false)}
                disabled={savingEdit}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => void confirmSaveEdit()}
                disabled={savingEdit}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingEdit ? "Menyimpan..." : "Ya, Simpan"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
