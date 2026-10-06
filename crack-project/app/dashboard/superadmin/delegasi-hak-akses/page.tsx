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

export default function DelegasiHakAksesPage() {
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
    <div className="p-2">
      <h1 className="text-3xl font-semibold mb-8">Delegasi Hak Akses</h1>

      <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden mb-12">
        <thead>
          <tr className="bg-primary text-white text-center">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Role Delegation</th>
            <th className="px-4 py-3">Created At</th>
            <th className="px-4 py-3">Updated At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.id}
              className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
            >
              <td className="border px-4 py-2 font-medium">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary text-white">
                  {user.role}
                </span>
              </td>
              <td className="border px-4 py-2">
                <RoleDelegation
                  user={user}
                  token={token}
                  onRoleChange={(newRole, updatedAt) => {
                    setUsers((prev) =>
                      prev.map((u) =>
                        u.id === user.id ? { ...u, role: newRole, updatedAt } : u
                      )
                    );
                  }}
                />
              </td>
              <td className="border px-4 py-2">{new Date(user.createdAt).toLocaleString()}</td>
              <td className="border px-4 py-2">{new Date(user.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
