"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import useCurrentUser from "@/lib/useCurrentUser";

// Navbar-ын UserButton цэсний "Утас ба түлхүүр" товч энэ event-ээр цонхыг нээнэ.
export const OPEN_PHONE_MODAL = "open-phone-modal";

const FSA01_OPTIONS = [
  [true, "Тийм"],
  [false, "Үгүй"],
];

// Нэвтэрсэн хэрэглэгчээс утасны дугаар болон FSA01 түлхүүртэй эсэхийг асуух
// modal (заавал биш). Хоч нэрээ сонгосны дараа, өмнө нь хариулаагүй
// (keyInfoAsked false) бол нэг удаа автоматаар гарна; дараа нь UserButton
// цэснээс засаж болно.
export default function PhoneModal() {
  const { profile, isSignedIn, loading } = useCurrentUser();
  // Хадгалсны дараа profile дахин татагдахгүй тул серверийн хариуг энд барина.
  const [saved, setSaved] = useState(null);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [hasFsa01, setHasFsa01] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Өөр хэрэглэгчээр нэвтэрвэл өмнөхийнх нь хадгалсан утгыг ашиглахгүй.
  const user = saved && saved._id === profile?._id ? saved : profile;

  // Өмнө өгсөн хариултаар бөглөөд нээнэ.
  function openWith(u) {
    setPhone(u?.phone || "");
    setHasFsa01(u?.hasFsa01 ?? null);
    setError(null);
    setOpen(true);
  }

  useEffect(() => {
    if (!loading && isSignedIn && profile?.nicknameSet && !profile.keyInfoAsked) {
      openWith(profile);
    }
  }, [loading, isSignedIn, profile]);

  useEffect(() => {
    const handleOpen = () => openWith(user);
    window.addEventListener(OPEN_PHONE_MODAL, handleOpen);
    return () => window.removeEventListener(OPEN_PHONE_MODAL, handleOpen);
  }, [user]);

  if (!open || !isSignedIn || !user) return null;

  async function save(fields) {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, keyInfoAsked: true }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Алдаа гарлаа.");
      return;
    }
    setSaved(data.user);
    setOpen(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    save({ phone: phone.trim(), hasFsa01 });
  }

  // Анх асуухад алгасвал өгөгдлийг өөрчлөхгүйгээр хариулсныг л тэмдэглэж,
  // дахин асуухгүй; цэснээс нээсэн бол зүгээр хаана.
  function handleSkip() {
    if (user.keyInfoAsked) setOpen(false);
    else save({});
  }

  return (
    <div className="modal-backdrop !z-[100]">
      <div className="modal-panel max-w-sm space-y-4">
        <div className="flex justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Phone className="h-5 w-5" />
          </span>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-brand-darker">Утасны дугаараа үлдээх үү?</h2>
          <p className="text-sm text-ink/60">
            Телеграфын түлхүүрийн шинэ загвар гарахад тань руу залгаж мэдэгдье.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-700 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <input
            autoFocus
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="99112233"
            className="input text-center"
            maxLength={20}
          />
          <div className="space-y-2">
            <p className="text-sm text-ink/70 text-center">
              Танд манай зардаг <span className="font-semibold">FSA01</span> түлхүүр байгаа юу?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FSA01_OPTIONS.map(([option, label]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={hasFsa01 === option}
                  onClick={() => setHasFsa01(hasFsa01 === option ? null : option)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                    hasFsa01 === option
                      ? "border-accent bg-accent/15 text-accent-dark"
                      : "border-surface text-ink/60 hover:border-brand-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSkip}
              disabled={saving}
              className="btn-secondary flex-1"
            >
              {user.keyInfoAsked ? "Болих" : "Алгасах"}
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
        <p className="text-xs text-ink/50 text-center leading-relaxed">
          <span className="font-semibold text-ink/70">Заавал биш.</span> Таны дугаарыг
          түлхүүрийн шинэ загвар гарахад мэдэгдэх, түлхүүрээ шинэчлэх хүсэлтийг тань
          хүлээн авахад ашиглана.
        </p>
      </div>
    </div>
  );
}
