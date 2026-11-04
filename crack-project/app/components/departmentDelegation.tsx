"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface DepartmentDelegationProps {
  user: { id: number; department: string };
  token: string;
  onDepartmentChange?: (newDepartment: string, updatedAt: string) => void;
}
 
export default function DepartmentDelegation({ user, token, onDepartmentChange }: DepartmentDelegationProps) {
  const [loading, setLoading] = useState(false);
  
  async function changeDepartment(newDepartment: string) {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // token superadmin
        },
        body: JSON.stringify({ department: newDepartment }),
      });

      if (!res.ok) throw new Error("Gagal update department");
        // const updatedUser = res.headers.get("content-type")?.includes("application/json")
        // ? await res.json()
        // : null;
        const updatedUser = await res.json(); 
      // pastikan API mengembalikan user terbaru dengan updatedAt

      if (onDepartmentChange) {
        onDepartmentChange(updatedUser.department, updatedUser.updatedAt);
      }

      toast.success("Department berhasil diupdate!");

      } catch (err) {
        console.error(err);
        toast.error("Terjadi kesalahan saat update department");
      } finally {
      setLoading(false);
      }
  }

  return (
    <select
      value={user.department}
      onChange={(e) => changeDepartment(e.target.value)}
      disabled={loading}
      className="border rounded px-2 py-1"
    >
      <option value="PRODUCTION">PRODUCTION</option>
      <option value="QA">QA</option>
      <option value="PPC">PPC</option>
      <option value="PROCUREMENT">PROCUREMENT</option>
      <option value="ENGINEER">ENGINEER</option>
      <option value="IT">IT</option>
      <option value="SALES">SALES</option>
      <option value="WAREHOUSE">WAREHOUSE</option>
      <option value="MAINTENANCE">MAINTENANCE</option>
      <option value="HRD">HRD</option>
      <option value="CUSTOMER">CUSTOMER</option>
      <option value="OTHER">OTHER</option>
    </select>
  );
}
