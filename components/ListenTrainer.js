"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  // target нь 5-аар бүлэглэхийн тулд зай агуулж болно (жиш: "ABCDE FGHIJ").
  // Зайг бичих шаардлагагүй, зөвхөн жинхэнэ тэмдэгтээр урт/оноо тооцно —
  // эс бөгөөс зай алгасвал дараагийн бүх тэмдэгт нэг байрлал шилжиж буруу
  // тооцогддог байсан.
  const cleanTarget = target.replace(/\s+/g, "");
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [finished, setFinished] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    setTyped("");
    setStartedAt(null);
    setFinished(false);
    setPlayCount(0);
    inputRef.current?.focus();
  }, [target]);

  const finish = useCallback(
    (finalTyped) => {
      if (finished) return;
      setFinished(true);
      const durationSeconds = startedAt ? (Date.now() - startedAt) / 1000 : 0;
      const result = buildAttemptResult({
        target: cleanTarget,
        input: finalTyped.replace(/\s+/g, ""),
        durationSeconds,
      });
      onComplete?.(result);
    },
    [finished, startedAt, cleanTarget, onComplete]
  );

  const handlePlay = useCallback(() => {
    playMorseSequence(morse, wpm, { frequency });
    setPlayCount((c) => c + 1);
    setStartedAt((prev) => prev ?? Date.now());
  }, [morse, wpm, frequency]);

  // Enter дарахад mouse-гүйгээр сонсоод, тэр даруй бичих талбар руу шилжинэ.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== "Enter" || finished) return;
      e.preventDefault();
      handlePlay();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finished, handlePlay]);

  function handleChange(e) {
    const val = e.target.value.toUpperCase();
    if (!startedAt) setStartedAt(Date.now());
    setTyped(val);
    if (val.replace(/\s+/g, "").length >= cleanTarget.length) finish(val);
  }

  function handleSubmit() {
    finish(typed);
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="label">Сонсоод бичнэ үү ({cleanTarget.length} тэмдэгт)</span>
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
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        disabled={finished}
        autoFocus
        className="input font-mono text-xl tracking-widest"
        placeholder="Сонссон тэмдэгтээ бичнэ үү... (Enter = сонсох)"
      />

      {!finished && typed.length > 0 && (
        <button onClick={handleSubmit} className="btn-ghost text-sm">
          Хариулт илгээх →
        </button>
      )}

      {/* Дуусахаас өмнө ч энэ хэсгийн зайг тогтмол хадгалж, үр дүн гарч ирэхэд
          доорх товч огцом шидэгдэхгүй байхаар (monkeytype-ийн байдлаар). */}
      <div className="min-h-[112px]">
        {finished && (
          <div className="space-y-2 animate-fade-in">
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
    </div>
  );
}
