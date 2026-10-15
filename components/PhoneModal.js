"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import useCurrentUser from "@/lib/useCurrentUser";

// Navbar-ын UserButton цэсний "Утас ба түлхүүр" товч энэ event-ээр цонхыг нээнэ.
export const OPEN_PHONE_MODAL = "open-phone-modal";

const STEPS = ["phone", "key"];

const FSA01_OPTIONS = [
  [true, "Тийм"],
  [false, "Үгүй"],
];

// Нэвтэрсэн хэрэглэгчээс хоёр алхмаар асуух modal (заавал биш): эхлээд утасны
// дугаар, дараа нь зурагтай нь FSA01 түлхүүртэй эсэх. Хоч нэрээ сонгосны
// дараа, өмнө нь хариулаагүй (keyInfoAsked false) бол нэг удаа автоматаар
// гарна; дараа нь UserButton цэснээс засаж болно. Алхам бүр хариултаа тэр
// дор нь хадгалдаг тул хоёр дахь алхамд хаасан ч утас нь үлдэнэ.
export default function PhoneModal() {
  const { profile, isSignedIn, loading } = useCurrentUser();
  // Хадгалсны дараа profile дахин татагдахгүй тул серверийн хариуг энд барина.
  const [saved, setSaved] = useState(null);
  const [step, setStep] = useState(null); // null бол хаалттай
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Өөр хэрэглэгчээр нэвтэрвэл өмнөхийнх нь хадгалсан утгыг ашиглахгүй.
  const user = saved && saved._id === profile?._id ? saved : profile;

  // Өмнө өгсөн дугаараар бөглөөд эхний алхмаас нээнэ.
  function openWith(u) {
    setPhone(u?.phone || "");
    setError(null);
    setStep("phone");
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

  if (!step || !isSignedIn || !user) return null;

  // Амжилттай хадгалбал true; алдааг одоогийн алхам дээр харуулна.
  async function save(fields) {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Алдаа гарлаа.");
      return false;
    }
    setSaved(data.user);
    return true;
  }

  function goTo(next) {
    setError(null);
    setStep(next);
  }

  async function handlePhoneSubmit(e) {
    e.preventDefault();
    if (await save({ phone: phone.trim() })) goTo("key");
  }

  async function answerKey(hasFsa01) {
    if (await save({ hasFsa01, keyInfoAsked: true })) setStep(null);
  }

  // Анх асуухад алгасвал хариулсныг л тэмдэглэж дахин асуухгүй; цэснээс
  // нээсэн бол зүгээр хаана.
  async function skipKey() {
    if (user.keyInfoAsked || (await save({ keyInfoAsked: true }))) setStep(null);
  }

  const errorBox = error && (
    <p className="text-red-700 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
  );

  return (
    <div className="modal-backdrop !z-[100]">
      <div className="modal-panel max-w-sm space-y-4">
        <div className="flex justify-center gap-1.5">
          {STEPS.map((s) => (
            <span
              key={s}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                s === step ? "bg-accent" : "bg-surface"
              }`}
            />
          ))}
        </div>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
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
            {errorBox}
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goTo("key")}
                disabled={saving}
                className="btn-secondary flex-1"
              >
                Алгасах
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? "Хадгалж байна..." : "Дараах"}
              </button>
            </div>
            <p className="text-xs text-ink/50 text-center leading-relaxed">
              <span className="font-semibold text-ink/70">Заавал биш.</span> Таны дугаарыг
              түлхүүрийн шинэ загвар гарахад мэдэгдэх, түлхүүрээ шинэчлэх хүсэлтийг тань
              хүлээн авахад ашиглана.
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <img
              src="/products/fsa01.jpg"
              alt="FSA01 телеграфын түлхүүр"
              width={960}
              height={540}
              className="w-full h-auto rounded-lg border border-surface bg-white"
            />
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-brand-darker">Танд FSA01 түлхүүр байгаа юу?</h2>
              <p className="text-sm text-ink/60">Зураг дээрх манай зардаг телеграфын түлхүүр.</p>
            </div>
            {errorBox}
            <div className="grid grid-cols-2 gap-2">
              {FSA01_OPTIONS.map(([option, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => answerKey(option)}
                  disabled={saving}
                  className={user.hasFsa01 === option ? "btn-primary" : "btn-secondary"}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => goTo("phone")} disabled={saving} className="btn-ghost">
                ← Буцах
              </button>
              <button type="button" onClick={skipKey} disabled={saving} className="btn-ghost">
                {user.keyInfoAsked ? "Хаах" : "Алгасах"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
