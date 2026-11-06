"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  changeSalesPassword,
  getSalesProfile,
  getSavedToken,
  updateSalesProfile,
} from "../sales/data";

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-slate-100";

export default function OwnProfileForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let active = true;
    void getSalesProfile(token)
      .then((data) => {
        if (!active) return;
        setName(data.name);
        setEmail(data.email);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Gagal memuat profil.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setError("Nama wajib diisi.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Format email belum benar.");
      return;
    }

    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = await updateSalesProfile(token, {
        name: trimmedName,
        email: trimmedEmail,
      });
      setName(updatedProfile.name);
      setEmail(updatedProfile.email);
      window.dispatchEvent(
        new CustomEvent("user-profile-updated", { detail: updatedProfile.name }),
      );
      setSuccess("Profil berhasil diperbarui.");
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error ? saveError.message : "Gagal menyimpan profil.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    const token = getSavedToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setChangingPassword(true);
    try {
      await changeSalesPassword(token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password berhasil diperbarui.");
    } catch (saveError: unknown) {
      setPasswordError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal memperbarui password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text sm:text-3xl">Profil Saya</h1>
        <p className="mt-2 text-sm text-slate-600">
          Perbarui nama, email, dan password akun Anda.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
        {loading ? (
          <p className="text-sm text-slate-500">Memuat profil...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Nama
              <input
                autoComplete="name"
                className={inputClass}
                disabled={saving}
                maxLength={50}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                autoComplete="email"
                className={inputClass}
                disabled={saving}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {success && <p role="status" className="text-sm text-green-700">{success}</p>}

            <div className="flex justify-end border-t border-border pt-5">
              <button
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                {saving ? "Menyimpan..." : "Simpan perubahan"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-text">Ubah Password</h2>
        <p className="mt-1 text-sm text-slate-600">
          Masukkan password saat ini dan pilih password baru minimal 8 karakter.
        </p>
        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Password saat ini
            <input
              autoComplete="current-password"
              className={inputClass}
              disabled={changingPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password baru
            <input
              autoComplete="new-password"
              className={inputClass}
              disabled={changingPassword}
              maxLength={64}
              minLength={8}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Konfirmasi password baru
            <input
              autoComplete="new-password"
              className={inputClass}
              disabled={changingPassword}
              maxLength={64}
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          {passwordError && (
            <p role="alert" className="text-sm text-red-600">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p role="status" className="text-sm text-green-700">{passwordSuccess}</p>
          )}

          <div className="flex justify-end border-t border-border pt-5">
            <button
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={changingPassword}
              type="submit"
            >
              {changingPassword ? "Memperbarui..." : "Ubah password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
