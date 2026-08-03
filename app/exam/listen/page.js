"use client";

import { useEffect, useState, useCallback } from "react";
import ListenTrainer from "@/components/ListenTrainer";
import ResultPanel from "@/components/ResultPanel";

const TOTAL_ROUNDS = 8;

export default function ListenExamPage() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState(null);

  const loadRound = useCallback(async () => {
    setLastResult(null);
    const res = await fetch("/api/exam/round?type=listen");
    if (res.status === 401) {
      setError("Шалгалт өгөхийн тулд эхлээд нэвтэрнэ үү.");
      return;
    }
    const data = await res.json();
    setRound(data);
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
        body: JSON.stringify({ type: "listen", attempts: next }),
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
    return <p className="text-red-700">{error}</p>;
  }

  if (finalResult) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-brand-darker">Шалгалт дууслаа!</h1>
        <ResultPanel
          result={{
            accuracy: finalResult.accuracy,
            errors: 0,
            wpm: finalResult.wpm,
            durationSeconds: 0,
          }}
        />
        <p>Эцсийн оноо: <strong>{finalResult.score}</strong></p>
        {finalResult.isNewMax && (
          <p className="text-brand-dark font-medium">🎉 Шинэ дээд амжилт тогтоолоо!</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-brand-darker">Listen Exam</h1>
        <p className="text-ink/70 text-sm mt-1">
          Үе {roundIndex + 1} / {TOTAL_ROUNDS}
        </p>
      </div>

      {round && !lastResult && (
        <ListenTrainer
          key={roundIndex}
          target={round.text}
          morse={round.morse}
          onComplete={handleComplete}
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
