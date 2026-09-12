"use client";

import { useEffect, useState, useCallback } from "react";
import { playMorseSequence } from "@/lib/audio";
import { buildAttemptResult } from "@/lib/scoring";

/**
 * Listen дадлага/шалгалтын нэг үений компонент.
 *
 * props:
 *  - target: string        зорилтот текст
 *  - morse: string          тохирох морзын код (тэмдэгт хооронд зай, үг хооронд "/")
 *  - onComplete(result)
 *  - fixedWpm, fixedFrequency: заавал биш. Өгвөл хурд/өнгийг эдгээрээр
 *    түгжиж, slider-г нуана (жиш нь Шалгалтад Багшийн тохируулсан утга).
 */
export default function ListenTrainer({ target, morse, onComplete, fixedWpm, fixedFrequency }) {
  const [wpm, setWpm] = useState(fixedWpm ?? 20);
  const frequency = fixedFrequency ?? 600;
  const locked = fixedWpm != null;
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [finished, setFinished] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    setTyped("");
    setStartedAt(null);
    setFinished(false);
    setPlayCount(0);
  }, [target]);

  const finish = useCallback(
    (finalTyped) => {
      if (finished) return;
      setFinished(true);
      const durationSeconds = startedAt ? (Date.now() - startedAt) / 1000 : 0;
      const result = buildAttemptResult({ target, input: finalTyped, durationSeconds });
      onComplete?.(result);
    },
    [finished, startedAt, target, onComplete]
  );

  function handlePlay() {
    playMorseSequence(morse, wpm, { frequency });
    setPlayCount((c) => c + 1);
    if (!startedAt) setStartedAt(Date.now());
  }

  function handleChange(e) {
    const val = e.target.value.toUpperCase();
    if (!startedAt) setStartedAt(Date.now());
    setTyped(val);
    if (val.length >= target.length) finish(val);
  }

  function handleSubmit() {
    finish(typed);
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="label">Сонсоод бичнэ үү ({target.length} тэмдэгт)</span>
          <p className="text-sm text-ink/50 mt-1">Тоглогдсон удаа: {playCount}</p>
        </div>

        {locked ? (
          <p className="text-sm text-ink/50">
            Хурд: <span className="font-semibold text-brand-darker">{wpm} WPM</span>
            <span className="text-ink/30"> · Багшийн тохиргоо</span>
          </p>
        ) : (
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
        )}
      </div>

      <button onClick={handlePlay} className="btn-primary" disabled={finished}>
        ▶ Сонсох
      </button>

      <input
        value={typed}
        onChange={handleChange}
        disabled={finished}
        className="input font-mono text-xl tracking-widest"
        placeholder="Сонссон тэмдэгтээ бичнэ үү..."
      />

      {!finished && typed.length > 0 && (
        <button onClick={handleSubmit} className="btn-ghost text-sm">
          Хариулт илгээх →
        </button>
      )}

      {finished && (
        <div className="space-y-2">
          <p className="text-accent-dark font-medium flex items-center gap-1.5">
            ✓ Дууслаа. Үр дүнг доор харна уу.
          </p>
          <div className="bg-surface-light border border-surface rounded-lg p-3.5">
            <p className="label">Зөв хариулт байсан</p>
            <p className="font-mono text-xl tracking-widest text-brand-darker mt-1">{target}</p>
          </div>
        </div>
      )}
    </div>
  );
}
