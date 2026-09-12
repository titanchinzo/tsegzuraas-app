"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { REVERSE_MORSE_MAP } from "@/lib/morse";
import { calcWPM } from "@/lib/scoring";
import { Circle, Minus, Check, X } from "lucide-react";
import ResultPanel from "@/components/ResultPanel";
import ExamLeaderboard from "@/components/ExamLeaderboard";

// Шалгалтын агуулга (зүүн) + дүнгийн самбар (баруун булан). lg-ээс доош
// самбар нь агуулгын доор давхарлана.
function ExamLayout({ type, refreshKey, children }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 animate-fade-in lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
      <aside className="lg:sticky lg:top-24 lg:w-64 lg:shrink-0">
        <ExamLeaderboard type={type} refreshKey={refreshKey} />
      </aside>
    </div>
  );
}

const TOTAL_ROUNDS = 5; // Макро-үений тоо
const GAP_MS = 1500;

export default function WriteExamPage() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [chars, setChars] = useState([]);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [morseInput, setMorseInput] = useState("");
  const [charResults, setCharResults] = useState([]);
  const [roundStartedAt, setRoundStartedAt] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState(null);
  const gapTimerRef = useRef(null);
  const morseInputRef = useRef("");

  const loadRound = useCallback(async () => {
    setLastResult(null);
    const res = await fetch("/api/exam/round?type=write");
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
    setCurrentCharIndex(0);
    morseInputRef.current = "";
    setMorseInput("");
    setCharResults([]);
    setRoundStartedAt(Date.now());
  }, []);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  // Санамж: setState updater дотор өөр setState дуудахаас зайлсхийж, ref-ээр
  // утгыг тогтвортой уншина (React 18 dev Strict Mode-той холбоотой алгасах
  // алдаанаас сэргийлнэ — write/page.js-тэй ижил загвар).
  const addSymbol = useCallback(
    (symbol) => {
      if (lastResult || currentCharIndex >= chars.length) return;
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
            const durationSeconds = (Date.now() - roundStartedAt) / 1000;
            const roundResult = {
              correct: correctCount,
              errors: nextResults.length - correctCount,
              total: nextResults.length,
              accuracy: Math.round((correctCount / nextResults.length) * 100),
              wpm: calcWPM(nextResults.length, durationSeconds),
              durationSeconds,
            };
            setLastResult(roundResult);
          }

          return nextResults;
        });

        setCurrentCharIndex((i) => i + 1);
        morseInputRef.current = "";
        setMorseInput("");
      }, GAP_MS);
    },
    [chars, currentCharIndex, lastResult, roundStartedAt]
  );

  useEffect(() => {
    if (!chars.length || lastResult) return;

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
  }, [chars, lastResult, addSymbol]);

  async function handleNextRound() {
    const next = [...attempts, lastResult];
    setAttempts(next);

    if (next.length >= TOTAL_ROUNDS) {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "write", attempts: next }),
      });
      const data = await res.json();
      if (res.ok) {
        setFinalResult(data.result);
      } else {
        setError(data.error || "Шалгалт хадгалахад алдаа гарлаа.");
      }
      return;
    }

    setRoundIndex((i) => i + 1);
    loadRound();
  }

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
      // refreshKey=1 — шалгалт хадгалагдсан тул самбарыг шинэ байртай дахин татна.
      <ExamLayout type="write" refreshKey={1}>
        <div className="space-y-5 text-center">
          <p className="text-4xl">🏁</p>
          <h1 className="page-title">Шалгалт дууслаа!</h1>
          <ResultPanel
            result={{
              accuracy: finalResult.accuracy,
              errors: 0,
              wpm: finalResult.wpm,
              durationSeconds: 0,
            }}
          />
          <p className="text-ink/70">
            Эцсийн оноо: <strong className="text-brand-darker text-lg">{finalResult.score}</strong>
          </p>
          {finalResult.isNewMax && (
            <p className="badge-accent mx-auto w-fit text-sm py-1.5 px-3">
              🎉 Шинэ дээд амжилт тогтоолоо!
            </p>
          )}
        </div>
      </ExamLayout>
    );
  }

  return (
    <ExamLayout type="write" refreshKey={0}>
      <div>
        <h1 className="page-title">Write Exam</h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="h-2 flex-1 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${(roundIndex / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
          <span className="text-sm text-ink/50 font-medium whitespace-nowrap">
            {roundIndex + 1} / {TOTAL_ROUNDS}
          </span>
        </div>
      </div>

      <div className="card p-6">
        {/* Тухайн үений тэмдэгтийн явц — радио дуудлагын хэвшлээр 5-аар бүлэглэнэ */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
          {chars.map((c, i) => {
            let cls = "border-surface bg-surface-light text-ink/30";
            if (i === currentCharIndex && !lastResult) {
              cls = "border-accent bg-accent/10 text-accent-dark scale-110";
            } else if (charResults[i]) {
              cls = charResults[i].correct
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-red-300 bg-red-50 text-red-600";
            }
            return (
              <div
                key={i}
                className={`relative flex h-14 w-14 items-center justify-center rounded-lg border-2 text-xl font-bold transition-all ${
                  i > 0 && i % 5 === 0 ? "ml-4" : ""
                } ${cls}`}
              >
                {charResults[i] ? (
                  <>
                    <span>{c}</span>
                    <span
                      className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-white ${
                        charResults[i].correct ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {charResults[i].correct ? (
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

        {!lastResult && chars.length > 0 && (
          <div className="flex flex-col items-center gap-4">
            {/* Кодлох тэмдэгт */}
            <div className="flex flex-col items-center gap-1 bg-brand-darker rounded-2xl px-10 py-4 min-w-[180px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Кодлох тэмдэгт
              </span>
              <p className="text-4xl font-mono font-bold text-white leading-tight">
                {chars[currentCharIndex]}
              </p>
            </div>

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
        )}

        {lastResult && (
          <div className="space-y-4 animate-fade-in">
            <ResultPanel result={lastResult} />
            <div className="flex justify-center">
              <button onClick={handleNextRound} className="btn-primary">
                {roundIndex + 1 >= TOTAL_ROUNDS ? "Шалгалтыг дуусгах →" : "Дараагийн үе →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ExamLayout>
  );
}
