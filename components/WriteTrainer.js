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
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs text-ink/60 uppercase tracking-wide">Зорилтот текст</span>
          <p className="text-2xl font-mono font-bold tracking-widest">{target}</p>
        </div>

        <label className="flex flex-col text-sm">
          Хурд (WPM): {wpm}
          <input
            type="range"
            min="5"
            max="40"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            className="w-40"
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
          className="w-full border border-surface rounded-md px-3 py-2 font-mono text-xl tracking-widest"
          placeholder="Энд бичнэ үү..."
        />
      ) : (
        <div className="space-y-1">
          <p className="text-sm text-ink/60">
            Q = Цэг (.) &nbsp;·&nbsp; W = Зураас (-)
          </p>
          <div className="w-full border border-surface rounded-md px-3 py-2 font-mono text-xl tracking-widest min-h-[3rem] bg-surface-light">
            {typed}
          </div>
        </div>
      )}

      {finished && (
        <p className="text-brand-darker font-medium">
          Дууслаа. Үр дүнг доор харна уу.
        </p>
      )}
    </div>
  );
}
