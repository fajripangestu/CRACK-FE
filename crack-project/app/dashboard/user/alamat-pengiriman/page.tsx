"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPinIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";

interface CustomerDetail {
  id: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
}

interface AddressForm {
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  email: string;
  phone: string;
}

const EMPTY_FORM: AddressForm = {
  companyName: "",
  companyAddress: "",
  contactPerson: "",
  email: "",
  phone: "",
};

function getSavedToken() {
  const tokenCookie = document.cookie.split("; ").find((cookie) => cookie.startsWith("token="));
  return tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;
}

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

function getErrorMessage(body: unknown, fallback: string) {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }
  return fallback;
}

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export default function ShippingAddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<CustomerDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
          throw new Error(getErrorMessage(body, "Gagal memuat alamat pengiriman."));
        }
        if (!Array.isArray(body) || !body.every(isCustomerDetail)) {
          throw new Error("Respons daftar alamat tidak valid.");
        }
        if (active) setAddresses(body);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Terjadi kesalahan saat memuat alamat pengiriman.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAddresses();
    return () => {
      active = false;
    };
  }, [router]);

  function updateField(field: keyof AddressForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/customer-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          companyAddress: form.companyAddress.trim(),
          contactPerson: form.contactPerson.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
        }),
      });
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(body, "Gagal menyimpan alamat pengiriman."));
      }
      if (!isCustomerDetail(body)) {
        throw new Error("Respons alamat yang disimpan tidak valid.");
      }

      setAddresses((current) => [body, ...current]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSuccess("Alamat pengiriman berhasil ditambahkan.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Terjadi kesalahan saat menyimpan alamat pengiriman.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Alamat Pengiriman</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola alamat dan kontak perusahaan untuk pengiriman pesanan.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <PlusIcon className="h-5 w-5" />
            Tambah Alamat Pengiriman
          </button>
        )}
      </header>

      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-lg font-semibold text-text">Tambah Alamat Pengiriman</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="companyName" className="mb-1.5 block text-sm font-medium text-text">
                Nama Perusahaan <span className="text-red-600">*</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                value={form.companyName}
                onChange={(event) => updateField("companyName", event.target.value)}
                className={inputClass}
                autoComplete="organization"
                required
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className="mb-1.5 block text-sm font-medium text-text">
                Contact Person <span className="text-red-600">*</span>
              </label>
              <input
                id="contactPerson"
                name="contactPerson"
                value={form.contactPerson}
                onChange={(event) => updateField("contactPerson", event.target.value)}
                className={inputClass}
                autoComplete="name"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="companyAddress" className="mb-1.5 block text-sm font-medium text-text">
                Alamat Pengiriman <span className="text-red-600">*</span>
              </label>
              <textarea
                id="companyAddress"
                name="companyAddress"
                value={form.companyAddress}
                onChange={(event) => updateField("companyAddress", event.target.value)}
                className={`${inputClass} min-h-24 resize-y`}
                autoComplete="street-address"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={inputClass}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-text">
                Nomor Telepon
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className={inputClass}
                autoComplete="tel"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={saving}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-background disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Alamat"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-slate-600">
          Memuat alamat pengiriman...
        </p>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <MapPinIcon className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-3 font-semibold text-text">Belum ada alamat pengiriman</h2>
          <p className="mt-1 text-sm text-slate-600">
            Tambahkan alamat perusahaan agar dapat digunakan untuk pesanan.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-text">{address.companyName}</h2>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {address.companyAddress}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    <p className="text-slate-600">
                      Contact: <span className="font-medium text-text">{address.contactPerson}</span>
                    </p>
                    {address.email && (
                      <p className="break-all text-slate-600">
                        Email: <span className="font-medium text-text">{address.email}</span>
                      </p>
                    )}
                    {address.phone && (
                      <p className="text-slate-600">
                        Telepon: <span className="font-medium text-text">{address.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
