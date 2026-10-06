// app/superadmin/delegasi-hak-akses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleDelegation from "@/app/components/roleDelegation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function KelolaUserPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const tokenCookie = document.cookie.split("; ").find((c) => c.startsWith("token="));
    const savedToken = tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;

    if (!savedToken) {
      router.push("/login");
    } else {
      setToken(savedToken);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((err) => console.error("Gagal fetch users:", err));
    }
  }, [router]);

  if (!token) return null;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">Kelola User</h1>
    </div>
  );
}
