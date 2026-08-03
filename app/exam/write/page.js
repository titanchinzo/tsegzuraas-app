"use client";

import { useEffect, useState, useCallback } from "react";
import WriteTrainer from "@/components/WriteTrainer";
import ResultPanel from "@/components/ResultPanel";
import { aggregateExamAttempts } from "@/lib/scoring";

const TOTAL_ROUNDS = 5;

export default function WriteExamPage() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [target, setTarget] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState(null);

  const loadRound = useCallback(async () => {
    setLastResult(null);
    const res = await fetch("/api/exam/round?type=write");
    if (res.status === 401) {
      setError("Шалгалт өгөхийн тулд эхлээд нэвтэрнэ үү.");
      return;
    }
    const data = await res.json();
    setTarget(data.text);
  }, []);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  async function handleComplete(result) {
    setLastResult(result);
    const next = [...attempts, result];
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
    }
  }

  function handleNextRound() {
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
      <div className="max-w-xl mx-auto space-y-5 text-center animate-fade-in">
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
          <p className="badge-accent mx-auto w-fit text-sm py-1.5 px-3">🎉 Шинэ дээд амжилт тогтоолоо!</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
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

      {target && !lastResult && (
        <WriteTrainer
          key={roundIndex}
          target={target}
          inputMode="keyboard"
          onComplete={handleComplete}
          allowRestart={false}
        />
      )}

      {lastResult && (
        <>
          <ResultPanel result={lastResult} />
          <button onClick={handleNextRound} className="btn-primary">
            Дараагийн үе →
          </button>
        </>
      )}
    </div>
  );
}
