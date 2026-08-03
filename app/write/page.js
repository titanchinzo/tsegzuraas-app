"use client";

import { useEffect, useState, useCallback } from "react";
import WriteTrainer from "@/components/WriteTrainer";
import ResultPanel from "@/components/ResultPanel";

export default function WritePracticePage() {
  const [target, setTarget] = useState(null);
  const [inputMode, setInputMode] = useState("keyboard");
  const [result, setResult] = useState(null);

  const loadNext = useCallback(async () => {
    setResult(null);
    const res = await fetch("/api/practice/write");
    const data = await res.json();
    setTarget(data.text);
  }, []);

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-brand-darker">Write — Бичих дадлага</h1>
        <p className="text-ink/70 text-sm mt-1">
          Random 5 тэмдэгтийг гараас эсвэл телеграфын түлхүүрээр (Q = Цэг, W = Зураас) бичнэ.
        </p>
      </div>

      <div className="flex gap-2">
        <ModeButton active={inputMode === "keyboard"} onClick={() => setInputMode("keyboard")}>
          Гараас бичих
        </ModeButton>
        <ModeButton active={inputMode === "key"} onClick={() => setInputMode("key")}>
          Түлхүүрээр (Q/W)
        </ModeButton>
      </div>

      {target && (
        <WriteTrainer
          key={target}
          target={target}
          inputMode={inputMode}
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

function ModeButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm border ${
        active
          ? "bg-brand-dark text-white border-brand-dark"
          : "border-surface text-ink/70"
      }`}
    >
      {children}
    </button>
  );
}
