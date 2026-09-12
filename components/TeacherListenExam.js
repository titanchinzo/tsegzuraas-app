"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { playMorseSequence } from "@/lib/audio";
import { textToMorse } from "@/lib/morse";
import { calcWPM } from "@/lib/scoring";

/**
 * Багшийн Listen шалгалт: бүтэн текстийг 5-тэмдэгтийн бүлгүүдэд хуваан,
 * бүлэг тус бүрийг дараалан тоглуулж, хугацаа (secondsPerGroup) дотор
 * бичүүлнэ. Бичиж дуусангуут эсвэл хугацаа дуусангуут дараагийн бүлэг рүү
 * автоматаар шилждэг тул чинээ мэдрэмжтэй, жинхэнэ шалгалтын хэлбэртэй.
 *
 * props:
 *  - groups: string[]  бүлгүүд (жиш: ["K3XQP", "N8ZRT"])
 *  - wpm, frequency: тоглуулах хурд/өнгө
 *  - secondsPerGroup: бүлэг тус бүрд өгөгдөх хугацаа (секунд)
 *  - onComplete(result)
 */
export default function TeacherListenExam({ groups, wpm, frequency, secondsPerGroup, onComplete }) {
  const [groupIndex, setGroupIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(secondsPerGroup);
  const inputRef = useRef(null);
  const advancedRef = useRef(false);
  const startedAtRef = useRef(Date.now());

  const currentGroup = groups[groupIndex];

  const advance = useCallback(
    (finalTyped) => {
      if (advancedRef.current) return;
      advancedRef.current = true;

      setResults((prev) => {
        const next = [
          ...prev,
          { expected: currentGroup, input: finalTyped, correct: finalTyped === currentGroup },
        ];

        if (groupIndex + 1 >= groups.length) {
          const correct = next.filter((r) => r.correct).length;
          const durationSeconds = (Date.now() - startedAtRef.current) / 1000;
          const totalChars = next.reduce((sum, r) => sum + r.expected.length, 0);
          onComplete?.({
            correct,
            errors: next.length - correct,
            total: next.length,
            accuracy: Math.round((correct / next.length) * 100),
            wpm: calcWPM(totalChars, durationSeconds),
            durationSeconds,
            results: next,
          });
        }
        return next;
      });

      if (groupIndex + 1 < groups.length) {
        setGroupIndex((i) => i + 1);
      }
    },
    [currentGroup, groupIndex, groups.length, onComplete]
  );

  const playCurrent = useCallback(() => {
    playMorseSequence(textToMorse(currentGroup), wpm, { frequency });
  }, [currentGroup, wpm, frequency]);

  // Шинэ бүлэг эхлэх бүрд тоглуулж, тоолуур эхлүүлнэ.
  useEffect(() => {
    advancedRef.current = false;
    setTyped("");
    setTimeLeft(secondsPerGroup);
    playCurrent();
    inputRef.current?.focus();

    const tick = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 0.1));
    }, 100);
    return () => clearInterval(tick);
    // groupIndex өөрчлөгдөх бүрд л дахин эхлүүлнэ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex]);

  // Хугацаа дуусангуут одоогийн бичсэнээр автоматаар илгээнэ.
  useEffect(() => {
    if (timeLeft <= 0) advance(typed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Enter дарахад дахин сонсоно (mouse хэрэггүй).
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      playCurrent();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playCurrent]);

  function handleChange(e) {
    const val = e.target.value.toUpperCase();
    setTyped(val);
    if (val.length >= currentGroup.length) advance(val);
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <span className="label">
          Бүлэг {groupIndex + 1} / {groups.length}
        </span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-28 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full bg-accent rounded-full"
              style={{ width: `${(timeLeft / secondsPerGroup) * 100}%` }}
            />
          </div>
          <span className="text-xs text-ink/40 tabular-nums w-6">{Math.ceil(timeLeft)}с</span>
        </div>
      </div>

      <div className="flex justify-center gap-1.5">
        {groups.map((g, i) => {
          let cls = "bg-surface";
          if (i < groupIndex) cls = results[i]?.correct ? "bg-green-400" : "bg-red-400";
          else if (i === groupIndex) cls = "bg-accent";
          return <span key={i} className={`h-1.5 w-6 rounded-full transition-colors ${cls}`} />;
        })}
      </div>

      <button onClick={playCurrent} className="btn-secondary text-sm">
        ↻ Дахин сонсох (Enter)
      </button>

      <input
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        autoFocus
        className="input font-mono text-2xl tracking-widest text-center"
        placeholder={"·".repeat(currentGroup?.length || 5)}
      />
    </div>
  );
}
