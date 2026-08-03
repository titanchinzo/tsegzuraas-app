"use client";

import { useEffect, useState, useCallback } from "react";
import { playMorseSequence } from "@/lib/audio";
import { buildAttemptResult } from "@/lib/scoring";

/**
 * Listen дадлага/шалгалтын нэг үений компонент.
 *
 * props:
 *  - target: string        зорилтот текст
 *  - morse: string          тохирох морзын код (" / " тусгаарлагчтай)
 *  - onComplete(result)
 */
export default function ListenTrainer({ target, morse, onComplete }) {
  const [wpm, setWpm] = useState(20);
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
    playMorseSequence(morse, wpm);
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
        <p className="text-accent-dark font-medium flex items-center gap-1.5">
          ✓ Дууслаа. Үр дүнг доор харна уу.
        </p>
      )}
    </div>
  );
}
