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
    <div className="modal-backdrop !z-[100]">
      <div className="modal-panel max-w-sm space-y-4">
        <div className="flex justify-center">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="h-2.5 w-6 rounded-full bg-accent" />
          </span>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-brand-darker">Тавтай морил!</h2>
          <p className="text-sm text-ink/60">
            Эхлэхийн өмнө өөртөө Nickname (хоч нэр) сонгоно уу.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-red-700 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nickname"
            className="input text-center"
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
