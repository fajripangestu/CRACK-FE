import { cookies } from "next/headers";
import BackButton from "./components/BackButton";

const DASHBOARD_BY_ROLE: Record<string, string> = {
  superadmin: "/dashboard/superadmin",
  admin: "/dashboard/admin",
  user: "/dashboard/user",
};

export default async function NotFound() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value?.toLowerCase().trim();

  // Kalau belum login / role tidak dikenal, fallback ke /login
  const dashboardUrl = (role && DASHBOARD_BY_ROLE[role]) || "/login";

  return (
    <div className="flex h-screen items-center justify-center bg-white text-center">
      <div className="max-w-md rounded-3xl border border-gray-200 bg-white p-10 shadow-[0_20px_60px_-20px_rgba(15,76,129,0.25)]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white shadow-md">
            !
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-slate-600">
            Silakan periksa kembali URL atau gunakan tombol di bawah untuk
            kembali ke halaman sebelumnya.
          </p>
          <BackButton fallbackUrl={dashboardUrl} />
        </div>
      </div>
    </div>
  );
}