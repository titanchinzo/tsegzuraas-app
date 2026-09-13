"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { REVERSE_MORSE_MAP } from "@/lib/morse";
import { calcWPM } from "@/lib/scoring";
import { playMorseSequence } from "@/lib/audio";
import { Circle, Minus } from "lucide-react";
import ResultPanel from "@/components/ResultPanel";

const GAP_MS = 1500;

// Багшийн Write шалгалт: Random Write Exam-тай (Score хуудсанд, rank-тай) ЯГ
// ХОЛБООГҮЙ тусдаа систем. Тухайн сурагчийн багшийн ExamQuestion сангаас
// нэг бүтэн текстийг татаж, monkeytype.com-ийн хэвшлээр бүтнээр нь харуулж
// (ирээдүй тэмдэгт сааралтсан, одоогийнх тодруулагдсан), товшсон цэг/зураас
// бүрийг сонсгож (дуутай), тэмдэгт тус бүрээр кодлуулна.
export default function TeacherWriteExamPage() {
  const [chars, setChars] = useState(null);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [morseInput, setMorseInput] = useState("");
  const [charResults, setCharResults] = useState([]);
  const [startedAt, setStartedAt] = useState(0);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({ wpm: 20, frequency: 600 });
  const gapTimerRef = useRef(null);
  const morseInputRef = useRef("");

  useEffect(() => {
    fetch("/api/exam/teacher-round?type=write").then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setError("Шалгалт өгөхийн тулд эхлээд нэвтэрнэ үү.");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Шалгалт ачаалахад алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }
      setChars(data.text.split(""));
      setStartedAt(Date.now());
    });

    fetch("/api/exam/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setSettings(data))
      .catch(() => {});
  }, []);

  // Санамж: setState updater дотор өөр setState дуудахаас зайлсхийж, ref-ээр
  // утгыг тогтвортой уншина (React 18 dev Strict Mode-той холбоотой алгасах
  // алдаанаас сэргийлнэ — exam/write/page.js-тэй ижил загвар).
  const addSymbol = useCallback(
    (symbol) => {
      if (!chars || finalResult || currentCharIndex >= chars.length) return;

      // Товшсон цэг/зураас бүрийг шууд сонсгоно (жинхэнэ түлхүүр шиг).
      playMorseSequence(symbol, settings.wpm, { frequency: settings.frequency });

      const next = morseInputRef.current + symbol;
      morseInputRef.current = next;
      setMorseInput(next);

      if (gapTimerRef.current) clearTimeout(gapTimerRef.current);

      gapTimerRef.current = setTimeout(() => {
        const finalInput = morseInputRef.current;
        const decoded = REVERSE_MORSE_MAP[finalInput] || "?";
        const expected = chars[currentCharIndex];
        const correct = decoded === expected;

        setCharResults((r) => {
          const nextResults = [...r, { char: expected, input: finalInput, decoded, correct }];

          if (nextResults.length >= chars.length) {
            const correctCount = nextResults.filter((x) => x.correct).length;
            const durationSeconds = (Date.now() - startedAt) / 1000;
            setFinalResult({
              correct: correctCount,
              errors: nextResults.length - correctCount,
              total: nextResults.length,
              accuracy: Math.round((correctCount / nextResults.length) * 100),
              wpm: calcWPM(nextResults.length, durationSeconds),
              durationSeconds,
            });
          }

          return nextResults;
        });

        setCurrentCharIndex((i) => i + 1);
        morseInputRef.current = "";
        setMorseInput("");
      }, GAP_MS);
    },
    [chars, currentCharIndex, finalResult, startedAt, settings]
  );

  useEffect(() => {
    if (!chars || finalResult) return;

    function handleKeyDown(e) {
      if (e.key === "q" || e.key === "Q" || e.key === ".") {
        e.preventDefault();
        addSymbol(".");
      } else if (e.key === "w" || e.key === "W" || e.key === "-") {
        e.preventDefault();
        addSymbol("-");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chars, finalResult, addSymbol]);

  if (error) {
    return (
      <div className="max-w-md mx-auto card p-6 text-center space-y-2 animate-fade-in">
        <p className="text-2xl">🔒</p>
        <p className="text-ink/70">{error}</p>
      </div>
    );
  }

  if (finalResult) {
    return (
      <div className="mx-auto max-w-md space-y-5 text-center animate-fade-in">
        <p className="text-4xl">🏁</p>
        <h1 className="page-title">Шалгалт дууслаа!</h1>
        <ResultPanel result={finalResult} />
      </div>
    );
  }

  if (!chars) {
    return <p className="text-ink/50 text-center">Ачааллаж байна...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Teacher Write</h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="h-2 flex-1 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${(currentCharIndex / chars.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-ink/50 font-medium whitespace-nowrap">
            {currentCharIndex} / {chars.length}
          </span>
        </div>
      </div>

      <div className="card p-6">
        {/* monkeytype.com маягийн урсгал текст: ирээдүй тэмдэгт сааралтсан,
            одоогийнх тодруулагдсан, бичсэн тэмдэгт зөв/буруугаараа өнгөлөгдөнэ. */}
        <div className="mb-8 max-h-64 overflow-y-auto rounded-lg bg-surface-light p-5">
          <p className="font-mono text-2xl leading-loose tracking-wide">
            {chars.map((c, i) => {
              let cls = "text-ink/25";
              if (i < currentCharIndex) {
                cls = charResults[i]?.correct ? "text-green-600" : "text-red-500 underline decoration-red-300";
              } else if (i === currentCharIndex) {
                cls = "text-white bg-accent rounded px-0.5";
              }
              return (
                <span key={i} className={`${cls} ${i > 0 && i % 5 === 0 ? "ml-2.5" : ""}`}>
                  {c}
                </span>
              );
            })}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 min-w-[120px] items-center justify-center rounded-lg border border-surface bg-surface-card px-4">
            <span className="font-mono text-2xl tracking-widest text-brand-darker">
              {morseInput || <span className="text-ink/30 text-sm">...</span>}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => addSymbol(".")}
              className="h-16 w-16 rounded-full border-2 border-brand-dark text-brand-darker hover:bg-brand-50 active:scale-95 transition-all flex items-center justify-center"
            >
              <Circle className="h-4 w-4 fill-current" />
            </button>
            <button
              onClick={() => addSymbol("-")}
              className="h-16 w-24 rounded-full border-2 border-brand-dark text-brand-darker hover:bg-brand-50 active:scale-95 transition-all flex items-center justify-center"
            >
              <Minus className="h-6 w-6" />
            </button>
          </div>

          <p className="text-xs text-ink/50 text-center">
            Түр зогсоход автоматаар илгээнэ &middot;{" "}
            <kbd className="rounded bg-surface-light px-1 py-0.5 text-xs font-mono border border-surface">q</kbd>/
            <kbd className="rounded bg-surface-light px-1 py-0.5 text-xs font-mono border border-surface">.</kbd> цэг{" "}
            <kbd className="rounded bg-surface-light px-1 py-0.5 text-xs font-mono border border-surface">w</kbd>/
            <kbd className="rounded bg-surface-light px-1 py-0.5 text-xs font-mono border border-surface">-</kbd> зураас
          </p>
        </div>
      </div>
    </div>
  );
}
