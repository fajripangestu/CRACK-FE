"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface PositionDelegationProps {
  user: { id: number; position: string };
  token: string;
  onPositionChange?: (newPosition: string, updatedAt: string) => void;
}
 
export default function PositionDelegation({ user, token, onPositionChange }: PositionDelegationProps) {
  const [loading, setLoading] = useState(false);
  
  async function changePosition(newPosition: string) {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // token superadmin
        },
        body: JSON.stringify({ position: newPosition }),
      });

      if (!res.ok) throw new Error("Gagal update position");
        // const updatedUser = res.headers.get("content-type")?.includes("application/json")
        // ? await res.json()
        // : null;
        const updatedUser = await res.json(); 
      // pastikan API mengembalikan user terbaru dengan updatedAt

      if (onPositionChange) {
        onPositionChange(updatedUser.position, updatedUser.updatedAt);
      }

      toast.success("Position berhasil diupdate!");

      } catch (err) {
        console.error(err);
        toast.error("Terjadi kesalahan saat update position");
      } finally {
      setLoading(false);
      }
  }

  return (
    <select
      value={user.position}
      onChange={(e) => changePosition(e.target.value)}
      disabled={loading}
      className="border rounded px-2 py-1"
    >
      <option value="OWNER">OWNER</option>
      <option value="GENERAL_MANAGER">GENERAL MANAGER</option>
      <option value="CONSULTANT">CONSULTANT</option>
      <option value="GM_ASSISTANT">GM ASSISTANT</option>
      <option value="MANAGER">MANAGER</option>
      <option value="SUPERVISOR">SUPERVISOR</option>
      <option value="TEAM_LEADER">TEAM LEADER</option>
      <option value="ENGINEER">ENGINEER</option>
      <option value="ADMINISTRATIVE_STAFF">ADMINISTRATIVE STAFF</option>
      <option value="OPERATOR">OPERATOR</option>
      <option value="TESTER">TESTER</option>
      <option value="CUSTOMER">CUSTOMER</option>
      <option value="INTERNSHIP">INTERNSHIP</option>
      <option value="OTHER">OTHER</option>
      </select>
  );
}
