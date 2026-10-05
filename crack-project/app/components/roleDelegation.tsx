"use client";

interface RoleDelegationProps {
  user: { id: number; role: string };
  token: string;
}

export default function RoleDelegation({ user, token }: RoleDelegationProps) {
  async function changeRole(newRole: string) {
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
      alert(`Role user #${user.id} berhasil diubah menjadi ${newRole}`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat update role");
    }
  }

  return (
    <select
      value={user.role}
      onChange={(e) => changeRole(e.target.value)}
      className="border rounded px-2 py-1"
    >
      <option value="USER">USER</option>
      <option value="ADMIN">ADMIN</option>
      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
    </select>
  );
}
