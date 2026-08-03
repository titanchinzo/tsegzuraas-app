"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { unitDurationMs } from "@/lib/morse";
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
export default function WriteTrainer({ target, inputMode = "keyboard", onComplete }) {
  const [wpm, setWpm] = useState(20);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTyped("");
    setStartedAt(null);
    setFinished(false);
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
    const val = e.target.value.toUpperCase();
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

  useMorseKeyer({
    enabled: inputMode === "key" && !finished,
    unitMs: unitDurationMs(wpm),
    onDecodedChar,
  });

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="label">Зорилтот текст</span>
          <p className="text-3xl font-mono font-bold tracking-widest text-brand-darker mt-1">{target}</p>
        </div>

        <label className="flex flex-col text-sm gap-1 text-ink/60">
          Хурд (WPM): <span className="font-semibold text-brand-darker">{wpm}</span>
          <input
            type="range"
            min="5"
            max="40"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            className="w-40 accent-accent"
          />
        </label>
      </div>

      {inputMode === "keyboard" ? (
        <input
          ref={inputRef}
          value={typed}
          onChange={handleChange}
          disabled={finished}
          autoFocus
          className="input font-mono text-xl tracking-widest"
          placeholder="Энд бичнэ үү..."
        />
      ) : (
        <div className="space-y-1.5">
          <p className="text-sm text-ink/50">
            <kbd className="badge-brand">Q</kbd> = Цэг (.) &nbsp;·&nbsp; <kbd className="badge-brand">W</kbd> = Зураас (-)
          </p>
          <div className="w-full border border-surface rounded-lg px-3.5 py-2.5 font-mono text-xl tracking-widest min-h-[3.25rem] bg-surface-light">
            {typed}
            <span className="inline-block w-0.5 h-5 bg-accent align-middle animate-pulse ml-0.5" />
          </div>
        </div>
      )}

      {finished && (
        <p className="text-accent-dark font-medium flex items-center gap-1.5">
          ✓ Дууслаа. Үр дүнг доор харна уу.
        </p>
      )}
    </div>
  );
}
