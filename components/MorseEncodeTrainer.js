"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Minus, Check, X, Delete } from "lucide-react";
import { MORSE_MAP } from "@/lib/morse";

const GAP_MS = 1200;

/**
 * Тэмдэгтийг цэг/зураасаар кодлох дадлага.
 *
 * props:
 *  - chars: string[]  дараалан кодлох тэмдэгтүүд
 *  - onFinish({ results, correct, total, accuracy, durationSeconds })
 *
 * Хариуг MORSE_MAP-тай ШУУД тулгаж шалгана (REVERSE_MORSE_MAP-аар тайлдаггүй) —
 * зарим тэмдэгт ижил кодтой байдаг тул буцаан тайлах нь эргэлзээ үүсгэдэг.
 */
export default function MorseEncodeTrainer({ chars, onFinish }) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [startedAt, setStartedAt] = useState(null);

  // Санамж: setState updater дотор өөр setState дуудвал React 18 dev Strict
  // Mode-ын давхар дуудалт бодит хажуугийн үр дагаварыг хоёр удаа ажиллуулдаг.
  // Тиймээс явцын утгыг ref-д барьж, бүх setState-ийг цэвэр байлгана.
  const inputRef = useRef("");
  const indexRef = useRef(0);
  const timerRef = useRef(null);
  const doneRef = useRef(false);

  const total = chars.length;
  const current = chars[index];

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const commit = useCallback(() => {
    const typed = inputRef.current;
    if (!typed) return;

    const i = indexRef.current;
    const expected = chars[i];
    const correct = typed === MORSE_MAP[expected];

    inputRef.current = "";
    indexRef.current = i + 1;
    setInput("");
    setIndex(i + 1);
    setResults((prev) => [...prev, { char: expected, input: typed, correct }]);
  }, [chars]);

  // Бүх тэмдэгт дуусмагц нэг л удаа мэдэгдэнэ.
  useEffect(() => {
    if (doneRef.current || results.length < total || total === 0) return;
    doneRef.current = true;

    const correct = results.filter((r) => r.correct).length;
    onFinish?.({
      results,
      correct,
      total,
      accuracy: Math.round((correct / total) * 100),
      durationSeconds: startedAt ? (Date.now() - startedAt) / 1000 : 0,
    });
  }, [results, total, startedAt, onFinish]);

  const addSymbol = useCallback(
    (symbol) => {
      if (indexRef.current >= chars.length) return;
      if (!startedAt) setStartedAt(Date.now());

      inputRef.current += symbol;
      setInput(inputRef.current);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(commit, GAP_MS);
    },
    [chars.length, commit, startedAt]
  );

  const clearInput = useCallback(() => {
    clearTimeout(timerRef.current);
    inputRef.current = "";
    setInput("");
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.repeat) return;
      const k = e.key;
      if (k === "q" || k === "Q" || k === ".") {
        e.preventDefault();
        addSymbol(".");
      } else if (k === "w" || k === "W" || k === "-") {
        e.preventDefault();
        addSymbol("-");
      } else if (k === "Backspace") {
        e.preventDefault();
        clearInput();
      } else if (k === "Enter") {
        e.preventDefault();
        clearTimeout(timerRef.current);
        commit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addSymbol, clearInput, commit]);

  const finished = index >= total;

  return (
    <div className="space-y-6">
      {/* Явцын нүднүүд */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {chars.map((c, i) => {
          const r = results[i];
          let cls = "border-surface bg-surface-light text-ink/30";
          if (!r && i === index) cls = "border-accent bg-accent/10 text-accent-dark scale-110";
          else if (r)
            cls = r.correct
              ? "border-green-400 bg-green-50 text-green-700"
              : "border-red-400 bg-red-50 text-red-600";

          return (
            <div
              key={i}
              className={`relative flex h-11 w-11 items-center justify-center rounded-lg border-2 text-base font-bold transition-all ${cls}`}
            >
              {r ? (
                <>
                  <span>{r.char}</span>
                  <span
                    className={`absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white ${
                      r.correct ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {r.correct ? (
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    ) : (
                      <X className="h-2.5 w-2.5" strokeWidth={3} />
                    )}
                  </span>
                </>
              ) : (
                <span className="text-xs">{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {!finished && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex min-w-[180px] flex-col items-center gap-1 rounded-2xl bg-brand-darker px-10 py-4">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Кодлох тэмдэгт
            </span>
            <p className="font-mono text-4xl font-bold leading-tight text-white">{current}</p>
          </div>

          <div className="flex h-12 min-w-[140px] items-center justify-center rounded-lg border border-surface bg-surface-card px-4">
            <span className="font-mono text-2xl tracking-widest text-brand-darker">
              {input || <span className="text-sm text-ink/30">...</span>}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => addSymbol(".")}
              aria-label="Цэг"
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-dark text-brand-darker transition-all hover:bg-brand-50 active:scale-95"
            >
              <Circle className="h-4 w-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => addSymbol("-")}
              aria-label="Зураас"
              className="flex h-16 w-24 items-center justify-center rounded-full border-2 border-brand-dark text-brand-darker transition-all hover:bg-brand-50 active:scale-95"
            >
              <Minus className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={clearInput}
              aria-label="Арилгах"
              disabled={!input}
              className="flex h-12 w-12 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-surface hover:text-ink disabled:opacity-30"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>

          <p className="text-center text-xs text-ink/50">
            Түр зогсоход автоматаар илгээнэ &middot;{" "}
            <kbd className="rounded border border-surface bg-surface-light px-1 py-0.5 font-mono text-xs">
              q
            </kbd>{" "}
            цэг{" "}
            <kbd className="rounded border border-surface bg-surface-light px-1 py-0.5 font-mono text-xs">
              w
            </kbd>{" "}
            зураас{" "}
            <kbd className="rounded border border-surface bg-surface-light px-1 py-0.5 font-mono text-xs">
              ⌫
            </kbd>{" "}
            арилгах
          </p>
        </div>
      )}
    </div>
  );
}
