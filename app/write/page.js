"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { randomChars, REVERSE_MORSE_MAP } from "@/lib/morse";
import { playMorseSequence } from "@/lib/audio";
import { PenTool, RotateCcw, ArrowRight, Minus, Circle, Check, X } from "lucide-react";
import Link from "next/link";

const ROUND_SIZE = 5;
const GAP_MS = 1500;

export default function WritePracticePage() {
  const [wpm, setWpm] = useState(15);
  const [chars, setChars] = useState([]);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [morseInput, setMorseInput] = useState("");
  const [results, setResults] = useState([]);
  const [started, setStarted] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const gapTimerRef = useRef(null);
  const morseInputRef = useRef("");

  const startRound = useCallback(() => {
    const newChars = randomChars(ROUND_SIZE).split("");
    setChars(newChars);
    setCurrentCharIndex(0);
    morseInputRef.current = "";
    setMorseInput("");
    setResults([]);
    setRoundComplete(false);
    setStarted(true);
    setStartTime(Date.now());
  }, []);

  // Санамж: доорх timeout callback нь setMorseInput-ийн updater дотор өөр
  // setState дуудахаас (setResults г.м) зайлсхийнэ — React 18 dev Strict Mode
  // updater callback-ийг цэвэр биш бол 2 удаа дуудаж, тэмдэгт алгасах алдаа
  // үүсгэдэг тул morseInputRef ашиглан утгыг гаднаас нь тогтвортой уншина.
  const addSymbol = useCallback(
    (symbol) => {
      if (roundComplete) return;
      playMorseSequence(symbol, wpm);
      const next = morseInputRef.current + symbol;
      morseInputRef.current = next;
      setMorseInput(next);

      if (gapTimerRef.current) clearTimeout(gapTimerRef.current);

      gapTimerRef.current = setTimeout(() => {
        const finalInput = morseInputRef.current;
        const decoded = REVERSE_MORSE_MAP[finalInput] || "?";
        const expected = chars[currentCharIndex];
        const correct = decoded === expected;

        setResults((r) => [...r, { char: expected, input: finalInput, decoded, correct }]);

        if (currentCharIndex + 1 >= chars.length) {
          setRoundComplete(true);
          setEndTime(Date.now());
        } else {
          setCurrentCharIndex((i) => i + 1);
        }

        morseInputRef.current = "";
        setMorseInput("");
      }, GAP_MS);
    },
    [chars, currentCharIndex, roundComplete, wpm]
  );

  // Гарын товчлол: q эсвэл . = цэг, w эсвэл - = зураас
  useEffect(() => {
    if (!started || roundComplete) return;

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
  }, [started, roundComplete, addSymbol]);

  const accuracy =
    results.length > 0
      ? Math.round((results.filter((r) => r.correct).length / results.length) * 100)
      : 0;

  const timeSpent = endTime && startTime ? ((endTime - startTime) / 1000).toFixed(1) : "0";

  const avgScore =
    results.length > 0
      ? Math.round(
          (accuracy +
            Math.min(100, (results.filter((r) => r.correct).length / ((endTime - startTime) / 1000)) * 20)) /
            2
        )
      : 0;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15">
          <PenTool className="h-6 w-6 text-accent-dark" />
        </div>
        <h1 className="page-title">Write</h1>
        <p className="page-subtitle">Тэмдэгтийг морзын кодоор бичих дадлага</p>
      </div>

      {/* Хурдны slider */}
      <div className="mb-8 card p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink/80">Хурд</span>
          <span className="font-mono text-sm text-accent-dark">{wpm} WPM</span>
        </div>
        <input
          type="range"
          min={1}
          max={90}
          step={1}
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          className="w-full accent-accent mt-3"
        />
      </div>

      <div className="card p-6">
        {!started ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-ink/60 text-center">
              Систем санамсаргүй тэмдэгт харуулна. Тэмдэгт бүрийг морзын кодоор бичнэ үү.
            </p>
            <div className="rounded-lg bg-surface-light p-3 text-xs text-ink/60">
              <p className="font-medium text-ink/90 mb-1">Гарын товчлол</p>
              <p>
                <kbd className="rounded bg-surface-light px-1.5 py-0.5 text-xs font-mono border border-surface">q</kbd> эсвэл{" "}
                <kbd className="rounded bg-surface-light px-1.5 py-0.5 text-xs font-mono border border-surface">.</kbd> = цэг
                &nbsp;&nbsp;
                <kbd className="rounded bg-surface-light px-1.5 py-0.5 text-xs font-mono border border-surface">w</kbd> эсвэл{" "}
                <kbd className="rounded bg-surface-light px-1.5 py-0.5 text-xs font-mono border border-surface">-</kbd> = зураас
              </p>
            </div>
            <button onClick={startRound} className="btn-accent gap-2">
              <PenTool className="h-4 w-4" />
              Эхлэх
            </button>
          </div>
        ) : (
          <>
            {/* Явцын индикатор — хариулахаас өмнө тэмдэгт харагдахгүй (anti-cheat) */}
            <div className="mb-6 flex items-center justify-center gap-3">
              {chars.map((c, i) => {
                let cls = "border-surface bg-surface-light text-ink/30";
                if (i === currentCharIndex && !roundComplete) {
                  cls = "border-accent bg-accent/10 text-accent-dark scale-110";
                } else if (results[i]) {
                  cls = results[i].correct
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-red-300 bg-red-50 text-red-600";
                }
                return (
                  <div
                    key={i}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-lg border-2 text-xl font-bold transition-all ${cls}`}
                  >
                    {results[i] ? (
                      <>
                        <span>{c}</span>
                        <span
                          className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-white ${
                            results[i].correct ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {results[i].correct ? (
                            <Check className="h-3 w-3" strokeWidth={3} />
                          ) : (
                            <X className="h-3 w-3" strokeWidth={3} />
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm">{i + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {!roundComplete && (
              <div className="flex flex-col items-center gap-4">
                {/* Кодлох тэмдэгт — үсэг/тоог харуулна, гэхдээ хариулт (морз код) нуугдмал */}
                <div className="flex flex-col items-center gap-1 bg-brand-darker rounded-2xl px-10 py-4 min-w-[180px]">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                    Кодлох тэмдэгт
                  </span>
                  <p className="text-4xl font-mono font-bold text-white leading-tight">
                    {chars[currentCharIndex]}
                  </p>
                </div>

                {/* Одоогийн морз бичлэг */}
                <div className="flex h-12 min-w-[120px] items-center justify-center rounded-lg border border-surface bg-surface-card px-4">
                  <span className="font-mono text-2xl tracking-widest text-brand-darker">
                    {morseInput || <span className="text-ink/30 text-sm">...</span>}
                  </span>
                </div>

                {/* Хүлээгдэж буй морзын КОД (жиш нь ".-.") ЗААГДАХГҮЙ — anti-cheat */}

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
            )}

            {roundComplete && (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="grid w-full max-w-sm grid-cols-3 gap-3">
                  <div className="flex flex-col items-center rounded-lg bg-surface-light p-3">
                    <span className="text-xl font-bold text-brand-darker">{timeSpent}с</span>
                    <span className="text-xs text-ink/50">Хугацаа</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-surface-light p-3">
                    <span className="text-xl font-bold text-brand-darker">{accuracy}%</span>
                    <span className="text-xs text-ink/50">Чанар</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-accent text-white p-3">
                    <span className="text-xl font-bold">{avgScore}</span>
                    <span className="text-xs text-white/70">Дундаж оноо</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {results.map((r, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span
                        className={`font-mono text-lg font-bold ${
                          r.correct ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {r.decoded}
                      </span>
                      <span className="font-mono text-xs text-ink/40">{r.input}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-ink/60">
                  {results.filter((r) => r.correct).length}/{results.length} зөв
                </p>
                <div className="flex gap-2">
                  <button onClick={startRound} className="btn-secondary gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Шинэ үе
                  </button>
                  <Link href="/exam/write">
                    <button className="btn-accent gap-2">
                      Шалгалт өгөх
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
