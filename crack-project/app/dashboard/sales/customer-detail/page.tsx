"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  CustomerDetail,
  createSalesRecord,
  getCustomerDetails,
  getSavedToken,
} from "../data";

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-slate-500">{children}</p>;
}

export default function SalesCustomerDetailsPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("ALL");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ?? null;

  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    const matchesSearch =
      !query ||
      [
        customer.companyName,
        customer.companyAddress,
        customer.contactPerson,
        customer.email ?? "",
        customer.phone ?? "",
        customer.user.name,
        customer.user.email,
      ].some((value) => value.toLocaleLowerCase("id-ID").includes(query));
    const matchesOrder =
      orderFilter === "ALL" ||
      (orderFilter === "WITH_ORDERS" && customer._count.customer_orders > 0) ||
      (orderFilter === "WITHOUT_ORDERS" && customer._count.customer_orders === 0);

    return matchesSearch && matchesOrder;
  });

  useEffect(() => {
    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let active = true;
    void getCustomerDetails(token)
      .then((customerData) => {
        if (active) setCustomers(customerData);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Gagal memuat daftar customer.",
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
    const formElement = event.currentTarget;

    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string | number> = {
      companyName: String(formData.get("companyName") ?? "").trim(),
      companyAddress: String(formData.get("companyAddress") ?? "").trim(),
      contactPerson: String(formData.get("contactPerson") ?? "").trim(),
    };
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    if (email) payload.email = email;
    if (phone) payload.phone = phone;

    setSaving(true);
    try {
      await createSalesRecord("customer-details/sales", token, payload, "Gagal menambahkan customer detail.");
      setCustomers(await getCustomerDetails(token));
      setShowForm(false);
      setSuccess("Customer detail berhasil ditambahkan.");
      formElement.reset();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "Terjadi kesalahan saat menyimpan customer detail.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text sm:text-3xl">Daftar Customer Detail</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? "Memuat data..." : `${customers.length} customer terdaftar`}
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
          {showForm ? "Tutup Form" : "Tambah Customer Detail"}
        </button>
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

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-text">Tambah Customer Detail</h2>
          <p className="mt-1 text-sm text-slate-600">
            Data perusahaan akan tercatat atas akun Admin Sales yang sedang login.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="companyName" className="mb-1.5 block text-sm font-medium text-text">
                Nama Perusahaan <span className="text-red-600">*</span>
              </label>
              <input id="companyName" name="companyName" className={inputClass} autoComplete="organization" required />
            </div>
            <div>
              <label htmlFor="contactPerson" className="mb-1.5 block text-sm font-medium text-text">
                Contact Person <span className="text-red-600">*</span>
              </label>
              <input id="contactPerson" name="contactPerson" className={inputClass} autoComplete="name" required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="companyAddress" className="mb-1.5 block text-sm font-medium text-text">
                Alamat Pengiriman <span className="text-red-600">*</span>
              </label>
              <textarea
                id="companyAddress"
                name="companyAddress"
                className={`${inputClass} min-h-24 resize-y`}
                autoComplete="street-address"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">Email</label>
              <input id="email" name="email" type="email" className={inputClass} autoComplete="email" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-text">Nomor Telepon</label>
              <input id="phone" name="phone" type="tel" className={inputClass} autoComplete="tel" />
            </div>
          </div>
          {formError && <p role="alert" className="mt-4 text-sm text-red-600">{formError}</p>}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Customer Detail"}
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
            placeholder="Cari perusahaan, kontak, atau akun"
            aria-label="Cari customer detail"
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <select
          value={orderFilter}
          onChange={(event) => setOrderFilter(event.target.value)}
          aria-label="Filter customer berdasarkan jumlah order"
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="ALL">Semua customer</option>
          <option value="WITH_ORDERS">Sudah memiliki order</option>
          <option value="WITHOUT_ORDERS">Belum memiliki order</option>
        </select>
      </div>

      <section
        aria-labelledby="selected-customer-title"
        className="mb-6 overflow-hidden rounded-xl border border-border bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 id="selected-customer-title" className="font-semibold text-text">
              Customer Detail Terpilih
            </h2>
          </div>
          {selectedCustomer && (
            <button
              type="button"
              onClick={() => setSelectedCustomerId(null)}
              aria-label="Tutup detail customer"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-background hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed text-left text-sm">
            <tbody className="divide-y divide-border">
              {selectedCustomer ? (
                <>
                  <tr className="align-top text-slate-700">
                    <th scope="row" className="w-[18%] bg-background px-4 py-3 font-semibold text-text">Perusahaan</th>
                    <td className="w-[32%] break-words px-4 py-3">{selectedCustomer.companyName}</td>
                    <th scope="row" className="w-[18%] bg-background px-4 py-3 font-semibold text-text">Contact Person</th>
                    <td className="w-[32%] break-words px-4 py-3">{selectedCustomer.contactPerson}</td>
                  </tr>
                  <tr className="align-top text-slate-700">
                    <th scope="row" className="bg-background px-4 py-3 font-semibold text-text">Alamat Pengiriman</th>
                    <td colSpan={3} className="whitespace-pre-wrap break-words px-4 py-3">{selectedCustomer.companyAddress}</td>
                  </tr>
                  <tr className="align-top text-slate-700">
                    <th scope="row" className="bg-background px-4 py-3 font-semibold text-text">Email</th>
                    <td className="break-words px-4 py-3">{selectedCustomer.email || "—"}</td>
                    <th scope="row" className="bg-background px-4 py-3 font-semibold text-text">Telepon</th>
                    <td className="break-words px-4 py-3">{selectedCustomer.phone || "—"}</td>
                  </tr>
                  <tr className="align-top text-slate-700">
                    <th scope="row" className="bg-background px-4 py-3 font-semibold text-text">Akun Sales</th>
                    <td className="break-words px-4 py-3">
                    <p>{selectedCustomer.user.name}</p>
                    <p className="text-xs text-slate-500">{selectedCustomer.user.email}</p>
                    </td>
                    <th scope="row" className="bg-background px-4 py-3 font-semibold text-text">Jumlah Order</th>
                    <td className="px-4 py-3">{selectedCustomer._count.customer_orders}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={4}>
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
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Perusahaan</th>
                <th className="px-4 py-3 font-semibold">Alamat</th>
                <th className="px-4 py-3 font-semibold">Contact Person</th>
                <th className="px-4 py-3 font-semibold">Kontak</th>
                <th className="px-4 py-3 font-semibold">Akun</th>
                <th className="px-4 py-3 text-center font-semibold">Jumlah Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6}><EmptyState>Memuat data customer...</EmptyState></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6}><EmptyState>Belum ada customer detail.</EmptyState></td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={6}><EmptyState>Tidak ada customer yang cocok dengan pencarian.</EmptyState></td></tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    className={`align-top ${
                      selectedCustomerId === customer.id
                        ? "cursor-pointer bg-primary/5"
                        : "cursor-pointer hover:bg-background/70"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-text">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomerId(customer.id)}
                        aria-pressed={selectedCustomerId === customer.id}
                        className="text-left text-primary hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        {customer.companyName}
                      </button>
                    </td>
                    <td className="max-w-xs whitespace-pre-wrap px-4 py-3 text-slate-600">{customer.companyAddress}</td>
                    <td className="px-4 py-3 text-slate-600">{customer.contactPerson}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {customer.email && <p>{customer.email}</p>}
                      {customer.phone && <p>{customer.phone}</p>}
                      {!customer.email && !customer.phone && "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{customer.user.name}</p>
                      <p className="text-xs">{customer.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {customer._count.customer_orders}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-5 py-4">
          <p className="text-sm text-slate-500">
            {loading ? "Memuat..." : `${filteredCustomers.length} dari ${customers.length} customer`}
          </p>
        </div>
      </section>
    </div>
  );
}
