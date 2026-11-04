"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallbackUrl }: { fallbackUrl: string }) {
  const router = useRouter();

  const handleBack = () => {
    const sameOrigin =
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin;

    if (sameOrigin) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-1"
    >
      Kembali
    </button>
  );
}