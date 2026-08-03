"use client";

import { useState } from "react";
import useCurrentUser from "@/lib/useCurrentUser";

// Анх нэвтэрсэн хэрэглэгчээс Nickname асуух modal (spec §3-B).
// profile.nicknameSet false үед л харагдана.
export default function NicknameModal() {
  const { profile, isSignedIn, loading } = useCurrentUser();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (loading || !isSignedIn || !profile || profile.nicknameSet) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: value.trim() }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Алдаа гарлаа.");
      setSaving(false);
      return;
    }
    location.reload();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
        <h2 className="text-lg font-bold text-brand-darker">Тавтай морил!</h2>
        <p className="text-sm text-ink/70">
          Эхлэхийн өмнө өөртөө Nickname (хоч нэр) сонгоно уу.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-red-700 text-sm">{error}</p>}
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nickname"
            className="w-full border border-surface rounded-md px-3 py-2"
            maxLength={30}
            required
          />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </form>
      </div>
    </div>
  );
}
