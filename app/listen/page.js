"use client";

import { useEffect, useState, useCallback } from "react";
import ListenTrainer from "@/components/ListenTrainer";
import ResultPanel from "@/components/ResultPanel";

export default function ListenPracticePage() {
  const [round, setRound] = useState(null); // { text, morse }
  const [result, setResult] = useState(null);

  const loadNext = useCallback(async () => {
    setResult(null);
    const res = await fetch("/api/practice/listen");
    const data = await res.json();
    setRound(data);
  }, []);

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="page-title">🎧 Listen — Сонсох дадлага</h1>
        <p className="page-subtitle">
          Санамсаргүй сонгосон 5 тэмдэгтийн морзын дууг сонсоод бичнэ үү.
        </p>
      </div>

      {round && (
        <ListenTrainer
          key={round.text}
          target={round.text}
          morse={round.morse}
          onComplete={setResult}
        />
      )}

      <ResultPanel result={result} />

      {result && (
        <button onClick={loadNext} className="btn-primary">
          Дараагийн дадлага →
        </button>
      )}
    </div>
  );
}
