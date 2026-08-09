"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle, Minus, Delete, Eye, EyeOff } from "lucide-react";
import { MORSE_MAP } from "@/lib/morse";

// Автоматаар илгээх завсар. Морзын стандарт тэмдэгт хоорондын завсар нь
// 3 нэгж боловч товч дарж кодлоход тэр нь хэт богино тул 12 нэгж авав.
export function commitGapMs(wpm) {
  const unit = 1200 / Math.max(1, wpm);
  return Math.min(3000, Math.max(250, Math.round(unit * 12)));
}

/**
 * Тэмдэгт/үгийг цэг зураасаар кодлох дадлага (monkeytype маягийн харагдац).
 *
 * props:
 *  - items: string[]   кодлох нэгжүүд. Нэг үсгийн хичээлд ["A","N",...],
 *                      үгийн хичээлд ["THE","AND",...]
 *  - wpm: number       автоматаар илгээх завсрыг тодорхойлно
 *  - hint: boolean     одоогийн тэмдэгтийн кодыг бүдэг харуулах эсэх
 *  - onFinish({ results, correct, total, accuracy, durationSeconds })
 *
 * Хариуг MORSE_MAP-тай ШУУД тулгана (буцаан тайлдаггүй) — зарим тэмдэгт ижил
 * кодтой тул тайлалт эргэлзээтэй.
 */
export default function MorseEncodeTrainer({
  items,
  wpm = 12,
  hint: hintProp = true,
  onFinish,
}) {
  // Үгсийг үсэг болгон задалж, аль үгийн хэддэх үсэг болохыг тэмдэглэнэ.
  const letters = useMemo(() => {
    const out = [];
    items.forEach((word, wordIndex) => {
      word.split("").forEach((char, indexInWord) => {
        out.push({ char, wordIndex, indexInWord });
      });
    });
    return out;
  }, [items]);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [startedAt, setStartedAt] = useState(null);
  const [hint, setHint] = useState(hintProp);

  // Санамж: setState updater дотор өөр setState дуудвал React 18 dev Strict
  // Mode-ын давхар дуудалт хажуугийн үр дагаварыг хоёр удаа ажиллуулна.
  // Тиймээс явцын утгыг ref-д барьж, updater-уудыг цэвэр байлгана.
  const inputRef = useRef("");
  const indexRef = useRef(0);
  const timerRef = useRef(null);
  const doneRef = useRef(false);

  const total = letters.length;
  const current = letters[index];
  const expected = current ? MORSE_MAP[current.char] || "" : "";
  const gap = commitGapMs(wpm);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const commit = useCallback(() => {
    const typed = inputRef.current;
    if (!typed) return;

    const i = indexRef.current;
    const target = letters[i];
    if (!target) return;

    inputRef.current = "";
    indexRef.current = i + 1;
    setInput("");
    setIndex(i + 1);
    setResults((prev) => [
      ...prev,
      { char: target.char, input: typed, correct: typed === MORSE_MAP[target.char] },
    ]);
  }, [letters]);

  useEffect(() => {
    if (doneRef.current || total === 0 || results.length < total) return;
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
      if (indexRef.current >= letters.length) return;
      if (!startedAt) setStartedAt(Date.now());

      inputRef.current += symbol;
      setInput(inputRef.current);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(commit, gap);
    },
    [letters.length, commit, startedAt, gap]
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

  // Үг бүрийн эхлэх индекс — үсгийн өнгө тодорхойлоход хэрэгтэй.
  const wordOffsets = useMemo(() => {
    const offsets = [];
    let acc = 0;
    items.forEach((w) => {
      offsets.push(acc);
      acc += w.length;
    });
    return offsets;
  }, [items]);

  const extra = input.length > expected.length ? input.slice(expected.length) : "";

  return (
    <div className="space-y-6">
      {/* Кодлох текст — monkeytype маягаар бүхэлд нь харуулж, бичсэнийг өнгөөр.
          Тусламж асаалттай үед үсэг бүрийн доор кодыг нь жижгээр бичнэ. */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 rounded-xl bg-surface-light px-4 py-5 font-mono">
        {items.map((word, wi) => (
          <span key={wi} className="flex gap-1">
            {word.split("").map((ch, ci) => {
              const idx = wordOffsets[wi] + ci;
              const r = results[idx];

              let cls = "text-ink/25"; // хараахан бичээгүй — бүдэг
              if (r) cls = r.correct ? "text-brand-dark" : "text-red-500";
              else if (idx === index) cls = "text-accent-dark";

              return (
                <span key={ci} className="flex flex-col items-center">
                  <span
                    className={`px-0.5 text-2xl leading-tight tracking-widest ${cls} ${
                      idx === index && !r ? "border-b-2 border-accent animate-pulse" : ""
                    }`}
                  >
                    {ch}
                  </span>
                  {hint && (
                    <span
                      className={`mt-1 text-[11px] leading-none tracking-tight ${
                        idx === index ? "text-accent-dark" : "text-ink/35"
                      }`}
                    >
                      {MORSE_MAP[ch]}
                    </span>
                  )}
                </span>
              );
            })}
          </span>
        ))}
      </div>

      {index < total && (
        <div className="flex flex-col items-center gap-4">
          {/* Одоогийн тэмдэгтийн код: бүдэг ghost дээр бичсэнээ давхарлана */}
          <div className="flex min-h-[52px] items-center justify-center gap-1.5 font-mono text-3xl">
            {hint ? (
              expected.split("").map((sym, i) => {
                const typed = input[i];
                if (typed === undefined)
                  return (
                    <span key={i} className="text-ink/15">
                      {sym}
                    </span>
                  );
                return (
                  <span key={i} className={typed === sym ? "text-brand-dark" : "text-red-500"}>
                    {typed}
                  </span>
                );
              })
            ) : input ? (
              <span className="tracking-widest text-brand-darker">{input}</span>
            ) : (
              <span className="text-sm text-ink/30">...</span>
            )}

            {extra.split("").map((sym, i) => (
              <span key={`x${i}`} className="text-red-500">
                {sym}
              </span>
            ))}
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

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-ink/50">
            <button
              type="button"
              onClick={() => setHint((h) => !h)}
              className="inline-flex items-center gap-1 transition-colors hover:text-brand-dark"
            >
              {hint ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {hint ? "Тусламж нуух" : "Тусламж харуулах"}
            </button>
            <span>·</span>
            <span>
              <kbd className="rounded border border-surface bg-surface-card px-1 py-0.5 font-mono">
                q
              </kbd>{" "}
              цэг{" "}
              <kbd className="rounded border border-surface bg-surface-card px-1 py-0.5 font-mono">
                w
              </kbd>{" "}
              зураас{" "}
              <kbd className="rounded border border-surface bg-surface-card px-1 py-0.5 font-mono">
                ⌫
              </kbd>{" "}
              арилгах
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
