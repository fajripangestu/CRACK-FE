import Link from "next/link";
import {
  ArrowRightIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

const pages = [
  {
    title: "Persetujuan Customer Order",
    description:
      "Periksa order dan catat keputusan persetujuan PPC berdasarkan posisi Anda.",
    href: "/dashboard/ppc/persetujuan-order",
    icon: ClipboardDocumentCheckIcon,
  },
];

export default function PpcDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">
          Dashboard PPC
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Tinjau customer order dan kelola persetujuan PPC.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {pages.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-text">{title}</span>
              <span className="mt-1 block text-sm text-slate-600">
                {description}
              </span>
            </span>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
