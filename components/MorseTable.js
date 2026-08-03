"use client";

import { useState } from "react";
import { CATEGORIES, MORSE_MAP } from "@/lib/morse";
import { playChar } from "@/lib/audio";
import WriteTrainer from "./WriteTrainer";
import ResultPanel from "./ResultPanel";

const TABS = [
  { key: "english", label: "English (A-Z)" },
  { key: "mongol", label: "Монгол (Кирилл)" },
  { key: "numbers", label: "Тоо (0-9)" },
  { key: "symbols", label: "Тэмдэгт" },
];

export default function MorseTable() {
  const [tab, setTab] = useState("english");
  const [active, setActive] = useState(null); // char сонгогдвол popup
  const [result, setResult] = useState(null);

  function openPractice(char) {
    setResult(null);
    setActive(char);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm border ${
              tab === t.key
                ? "bg-brand-dark text-white border-brand-dark"
                : "border-surface text-ink/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {CATEGORIES[tab].map((char) => (
          <button
            key={char}
            onClick={() => openPractice(char)}
            className="card p-4 text-center hover:shadow-md transition-shadow"
          >
            <p className="text-xl font-bold">{char}</p>
            <p className="font-mono text-brand-darker">{MORSE_MAP[char]}</p>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {active} — {MORSE_MAP[active]}
              </h3>
              <button onClick={() => setActive(null)} className="text-ink/50">
                ✕
              </button>
            </div>

            <button onClick={() => playChar(MORSE_MAP[active])} className="btn-primary">
              ▶ Дуугаар сонсох
            </button>

            <WriteTrainer key={active} target={active} inputMode="keyboard" onComplete={setResult} />
            <ResultPanel result={result} />
          </div>
        </div>
      )}
    </div>
  );
}
