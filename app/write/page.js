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
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="page-title">⌨️ Write — Бичих дадлага</h1>
        <p className="page-subtitle">
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
        <div className="flex justify-center">
          <button onClick={loadNext} className="btn-accent !rounded-full !px-8">
            Дараагийн дадлага →
          </button>
        </div>
      )}
    </div>
  );
}

function ModeButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={active ? "segmented-btn-active" : "segmented-btn-inactive"}>
      {children}
    </button>
  );
}
