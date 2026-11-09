"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AIMAGS } from "@/lib/aimags";
import MongoliaMap from "@/components/MongoliaMap";

// Admin: түлхүүрээр хичээллэж буй аймгуудыг чеклэх. Чеклэх бүрд шууд
// хадгалж, дээрх газрын зураг дээр тэр аймаг асна (нүүр хуудсанд ч мөн).
export default function KeyLocationChecklist() {
  const router = useRouter();
  const [active, setActive] = useState([]);
  const [loaded, setLoaded] = useState(false);
  // Нэг аймгийг хурдан дарааллан чеклэхэд хүсэлтүүд хоорондоо давхцахгүйн
  // тулд хариу иртэл тэр checkbox-ыг түгжинэ.
  const [pending, setPending] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/key-locations")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        setActive(data.aimags);
        setLoaded(true);
      })
      // Ачаалж чадаагүй бол checkbox-ууд түгжээтэй үлдэнэ — хоосон жагсаалтыг
      // "юу ч асаагүй" гэж андуурч дахин чеклэхээс сэргийлнэ.
      .catch(() => setError("Байршлыг ачаалж чадсангүй. Хуудсаа дахин ачаална уу."));
  }, []);

  async function toggle(key, on) {
    setError(null);
    setPending((p) => [...p, key]);
    setActive((a) => (on ? [...a, key] : a.filter((k) => k !== key)));

    const res = await fetch("/api/key-locations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aimag: key, active: on }),
    }).catch(() => null);

    if (res?.ok) {
      // Router-ийн кэш "Нүүр" рүү буцахад хуучин газрын зургийг 30 секунд
      // харуулдаг тул шинэчилнэ.
      router.refresh();
    } else {
      const data = await res?.json().catch(() => ({}));
      setError(data?.error || "Хадгалж чадсангүй. Дахин оролдоно уу.");
      setActive((a) => (on ? a.filter((k) => k !== key) : [...a, key]));
    }
    setPending((p) => p.filter((k) => k !== key));
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-brand-darker">Түлхүүрийн байршил</h2>
        <p className="text-sm text-ink/50">
          Аймгаа чеклэхэд нүүр хуудасны газрын зураг дээр асна.
        </p>
      </div>

      <MongoliaMap activeAimags={active} />

      <div className="card p-5 space-y-3">
        {loaded ? (
          <p className="text-sm text-ink/50">
            {active.length} / {AIMAGS.length} асаалттай
          </p>
        ) : (
          !error && <p className="text-sm text-ink/50">Ачааллаж байна...</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2.5">
          {AIMAGS.map((a) => (
            <label
              key={a.key}
              className="flex items-center gap-2.5 text-sm text-ink/80 cursor-pointer has-[:disabled]:cursor-wait has-[:disabled]:opacity-60"
            >
              <input
                type="checkbox"
                checked={active.includes(a.key)}
                disabled={!loaded || pending.includes(a.key)}
                onChange={(e) => toggle(a.key, e.target.checked)}
                className="h-4 w-4 accent-teal-600"
              />
              {a.name}
            </label>
          ))}
        </div>
        {error && <p className="text-red-700 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      </div>
    </section>
  );
}
