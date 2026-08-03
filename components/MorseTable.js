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
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={tab === t.key ? "segmented-btn-active" : "segmented-btn-inactive"}
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
            className="card card-hover p-4 text-center group"
          >
            <p className="text-xl font-bold group-hover:text-accent-dark transition-colors">{char}</p>
            <p className="font-mono text-brand-dark text-sm mt-0.5">{MORSE_MAP[char]}</p>
          </button>
        ))}
      </div>

      {active && (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <div className="modal-panel max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-darker">
                {active} <span className="text-accent-dark font-mono">{MORSE_MAP[active]}</span>
              </h3>
              <button
                onClick={() => setActive(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full text-ink/40 hover:bg-surface hover:text-ink transition-colors"
              >
                ✕
              </button>
            </div>

            <button onClick={() => playChar(MORSE_MAP[active])} className="btn-primary w-full">
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
