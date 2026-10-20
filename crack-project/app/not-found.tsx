export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-center">
      <div className="p-10 max-w-md rounded-3xl border border-border bg-background shadow-[0_20px_60px_-20px_rgba(15,76,129,0.25)]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold shadow-md">
            !
          </div>
          <h1 className="text-3xl font-semibold text-text">Halaman Tidak Ditemukan</h1>
          <p className="text-slate-600">
            Silakan periksa kembali URL atau gunakan tombol di bawah untuk kembali ke dashboard.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-1"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}