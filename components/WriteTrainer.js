"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { unitDurationMs, MORSE_MAP } from "@/lib/morse";
import useMorseKeyer from "./MorseKeyer";
import { buildAttemptResult } from "@/lib/scoring";

/**
 * Write дадлага/шалгалтын нэг үений компонент.
 *
 * props:
 *  - target: string       генерацлагдсан зорилтот текст (тоо+үсэг)
 *  - inputMode: "key" | "keyboard"  Тусгай түлхүүр (Q/W) эсвэл ердийн гараас
 *  - onComplete(result): дуусахад дуудагдана (buildAttemptResult-ийн буцаалт)
 */
export default function WriteTrainer({
  target,
  inputMode = "keyboard",
  onComplete,
  onReset,
  allowRestart = true,
}) {
  const [wpm, setWpm] = useState(20);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef(null);

  const reset = useCallback(() => {
    setTyped("");
    setStartedAt(null);
    setFinished(false);
    onReset?.();
    inputRef.current?.focus();
  }, [onReset]);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const finish = useCallback(
    (finalTyped) => {
      if (finished) return;
      setFinished(true);
      const durationSeconds = startedAt ? (Date.now() - startedAt) / 1000 : 0;
      const result = buildAttemptResult({
        target,
        input: finalTyped,
        durationSeconds,
      });
      onComplete?.(result);
    },
    [finished, startedAt, target, onComplete]
  );

  function handleChange(e) {
    const val = e.target.value.toUpperCase().slice(0, target.length);
    if (!startedAt) setStartedAt(Date.now());
    setTyped(val);
    if (val.length >= target.length) {
      finish(val);
    }
  }

  const onDecodedChar = useCallback(
    (char) => {
      if (!startedAt) setStartedAt(Date.now());
      setTyped((prev) => {
        const next = (prev + char).slice(0, target.length);
        if (next.length >= target.length) finish(next);
        return next;
      });
    },
    [startedAt, target, finish]
  );

  const { currentSymbols } = useMorseKeyer({
    enabled: inputMode === "key" && !finished,
    unitMs: unitDurationMs(wpm),
    onDecodedChar,
  });

  const decodedMorse = typed
    .split("")
    .map((ch) => MORSE_MAP[ch] || "?")
    .join("  ");

  return (
    <div className="card p-6 space-y-5">
      {/* Зорилтот текст — monkeytype-шиг тэмдэгт бүрээр зөв/буруу өнгөтэй */}
      <div
        className="relative bg-brand-darker rounded-full px-6 py-5 overflow-hidden cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="absolute left-6 top-2 text-xs font-semibold uppercase tracking-wide text-white/40">
          Зорилтот текст
        </span>
        <p className="text-center text-3xl md:text-4xl font-mono font-bold tracking-[0.3em] pt-2 select-none">
          {target.split("").map((ch, idx) => {
            let cls = "text-white/30"; // хараахан бичигдээгүй
            if (idx < typed.length) {
              cls = typed[idx] === ch ? "text-white" : "text-red-400 underline decoration-2 underline-offset-4";
            }
            const isCaret = idx === typed.length && !finished;
            return (
              <span
                key={idx}
                className={`${cls} ${isCaret ? "border-l-2 border-accent animate-pulse" : ""}`}
              >
                {ch}
              </span>
            );
          })}
        </p>

        {inputMode === "keyboard" && (
          <input
            ref={inputRef}
            value={typed}
            onChange={handleChange}
            disabled={finished}
            autoFocus
            className="absolute inset-0 w-full h-full opacity-0 cursor-text"
          />
        )}
      </div>

      {inputMode === "key" && (
        <p className="text-sm text-ink/50 text-center">
          <kbd className="badge-brand">Q</kbd> = Цэг (.) &nbsp;·&nbsp; <kbd className="badge-brand">W</kbd> = Зураас (-)
          &nbsp;·&nbsp; одоогийн тэмдэгт: <span className="font-mono text-brand-darker">{currentSymbols || "—"}</span>
        </p>
      )}

      {/* Одоогийн болон тайлсан морз */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1 bg-surface-light border border-surface rounded-xl p-3.5">
          <p className="label">Одоогийн морз</p>
          <p className="font-mono text-lg text-brand-darker mt-1 min-h-[1.75rem] break-all">
            {currentSymbols || <span className="text-ink/30">—</span>}
          </p>
        </div>
        <div className="col-span-2 bg-surface-light border border-surface rounded-xl p-3.5">
          <p className="label">Тайлсан морз</p>
          <p className="font-mono text-lg text-brand-darker mt-1 min-h-[1.75rem] break-all">
            {decodedMorse || <span className="text-ink/30">—</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-ink/60">
        <label className="flex items-center gap-3 flex-1">
          <span className="whitespace-nowrap">
            Хурд (WPM): <span className="font-semibold text-brand-darker">{wpm}</span>
          </span>
          <input
            type="range"
            min="5"
            max="40"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            className="flex-1 accent-accent"
          />
        </label>
        {allowRestart && (
          <button
            onClick={reset}
            type="button"
            className="btn-secondary !px-3 !py-1.5 text-sm shrink-0"
            title="Дахин эхлүүлэх"
          >
            ↻ Дахин эхлүүлэх
          </button>
        )}
      </div>

      {finished && (
        <p className="text-accent-dark font-medium flex items-center gap-1.5">
          ✓ Дууслаа. Үр дүнг доор харна уу.
        </p>
      )}
    </div>
  );
}
