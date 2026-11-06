"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001";

export default function CurrentUserGreeting() {
  const [name, setName] = useState("");

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((item) => item.startsWith("token="));
    const token = cookie ? decodeURIComponent(cookie.slice("token=".length)) : null;
    if (!token) return;

    let active = true;
    const onProfileUpdated = (event: Event) => {
      const updatedName = (event as CustomEvent<string>).detail;
      if (typeof updatedName === "string") setName(updatedName);
    };

    window.addEventListener("user-profile-updated", onProfileUpdated);
    void fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then(async (response) => {
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) throw new Error("Gagal memuat nama pengguna.");
        if (
          typeof body !== "object" ||
          body === null ||
          !("name" in body) ||
          typeof body.name !== "string"
        ) {
          throw new Error("Respons profil tidak valid.");
        }
        if (active) setName(body.name);
      })
      .catch((error: unknown) => {
        console.error("Gagal memuat nama pengguna:", error);
      });

    return () => {
      active = false;
      window.removeEventListener("user-profile-updated", onProfileUpdated);
    };
  }, []);

  return (
    <span className="max-w-32 truncate text-xs font-medium text-slate-700 sm:max-w-none sm:text-sm">
      {name ? `Hi, ${name}` : "Hi"}
    </span>
  );
}
