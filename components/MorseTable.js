"use client";

import { useState } from "react";
import { Star, Volume2, X, RotateCcw } from "lucide-react";
import { CATEGORIES, MORSE_MAP } from "@/lib/morse";
import { playChar } from "@/lib/audio";
import { starsFor } from "@/lib/studyLessons";
import MorseEncodeTrainer, { commitGapMs } from "@/components/MorseEncodeTrainer";

const TABS = [
  { key: "english", label: "English (A-Z)" },
  { key: "mongol", label: "Монгол (Кирилл)" },
  { key: "numbers", label: "Тоо (0-9)" },
  { key: "symbols", label: "Тэмдэгт" },
];

const DRILL_LENGTH = 5;

export default function MorseTable() {
  const [tab, setTab] = useState("english");
  const [active, setActive] = useState(null); // дадлага хийж буй тэмдэгт
  const [attempt, setAttempt] = useState(0);
  const [summary, setSummary] = useState(null);
  const [wpm, setWpm] = useState(12);

  function openPractice(char) {
    setSummary(null);
    setAttempt((a) => a + 1);
    setActive(char);
  }

  function close() {
    setActive(null);
    setSummary(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
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

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {CATEGORIES[tab].map((char) => (
          <div key={char} className="card card-hover overflow-hidden">
            <button
              onClick={() => openPractice(char)}
              className="group w-full p-4 text-center"
              title="Дадлага хийх"
            >
              <p className="text-xl font-bold transition-colors group-hover:text-accent-dark">
                {char}
              </p>
              <p className="mt-0.5 font-mono text-sm text-brand-dark">{MORSE_MAP[char]}</p>
            </button>
            <button
              onClick={() => playChar(MORSE_MAP[char], wpm)}
              aria-label={`${char} — дуугаар сонсох`}
              className="flex w-full items-center justify-center gap-1 border-t border-surface py-1.5 text-ink/35 transition-colors hover:bg-surface-light hover:text-accent-dark"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {active && (
        <div className="modal-backdrop" onClick={close}>
          <div
            className="modal-panel max-w-lg space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-darker">
                  {active} <span className="font-mono text-accent-dark">{MORSE_MAP[active]}</span>
                </h3>
                <p className="text-sm text-ink/50">
                  {DRILL_LENGTH} удаа цэг зураасаар кодлоно.
                </p>
              </div>
              <button
                onClick={close}
                aria-label="Хаах"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-surface hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-surface bg-surface-light px-3 py-2">
              <button
                onClick={() => playChar(MORSE_MAP[active], wpm)}
                className="btn-ghost text-sm"
              >
                <Volume2 className="h-4 w-4" />
                Сонсох
              </button>
              <label className="flex items-center gap-2 text-xs text-ink/55">
                {wpm} WPM
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={wpm}
                  onChange={(e) => setWpm(Number(e.target.value))}
                  aria-label="Хурд (WPM)"
                  className="w-28 accent-accent"
                />
              </label>
            </div>

            {summary ? (
              <div className="space-y-3 text-center">
                <div className="flex justify-center gap-1">
                  {[1, 2, 3].map((i) => (
                    <Star
                      key={i}
                      className={`h-7 w-7 ${
                        i <= summary.stars
                          ? "fill-accent text-accent"
                          : "fill-transparent text-ink/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-2xl font-bold text-brand-darker">{summary.accuracy}%</p>
                <p className="text-sm text-ink/55">
                  {summary.correct} / {summary.total} зөв
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSummary(null);
                      setAttempt((a) => a + 1);
                    }}
                    className="btn-secondary"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Дахин
                  </button>
                  <button onClick={close} className="btn-primary">
                    Болсон
                  </button>
                </div>
              </div>
            ) : (
              <MorseEncodeTrainer
                key={`${active}-${attempt}`}
                items={Array(DRILL_LENGTH).fill(active)}
                wpm={wpm}
                onFinish={(res) => setSummary({ ...res, stars: starsFor(res.accuracy) })}
              />
            )}

            <p className="text-center text-[11px] text-ink/35">
              Түр зогсоод {commitGapMs(wpm)}ms болмогц илгээнэ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
