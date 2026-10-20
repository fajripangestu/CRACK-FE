import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Anda tidak punya akses</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Akun Anda tidak memiliki izin untuk membuka halaman ini. Kembali ke dashboard
        sesuai peran Anda.
      </p>
      <Link
        href="/dashboard/admin"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Kembali ke dashboard
      </Link>
    </div>
  );
}