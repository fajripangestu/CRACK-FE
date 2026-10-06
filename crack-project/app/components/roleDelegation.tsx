"use client";

import { useState } from "react";

interface RoleDelegationProps {
  user: { id: number; role: string };
  token: string;
  onRoleChange?: (newRole: string, updatedAt: string) => void;
}

export default function RoleDelegation({ user, token, onRoleChange }: RoleDelegationProps) {
  const [loading, setLoading] = useState(false);
  
  async function changeRole(newRole: string) {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // token superadmin
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Gagal update role");
      const updatedUser = await res.json(); 
      // pastikan API mengembalikan user terbaru dengan updatedAt

      if (onRoleChange) {
        onRoleChange(updatedUser.role, updatedUser.updatedAt);
      }

      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat update role");
      } finally {
      setLoading(false);
      }
  }

  return (
    <select
      value={user.role}
      onChange={(e) => changeRole(e.target.value)}
      disabled={loading}
      className="border rounded px-2 py-1"
    >
      <option value="USER">USER</option>
      <option value="ADMIN">ADMIN</option>
      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
    </select>
  );
}
