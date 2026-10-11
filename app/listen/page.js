"use client";

import { useEffect, useState, useCallback } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import ListenTrainer from "@/components/ListenTrainer";
import ResultPanel from "@/components/ResultPanel";

export default function ListenPracticePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [round, setRound] = useState(null); // { text, morse }
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // { text, needsSignIn }

  // API нь нэвтрээгүй үед { error } буцаадаг. Өмнө нь түүнийг шууд round
  // болгож, ListenTrainer-т target=undefined очоод хуудас бүхэлдээ унадаг байв.
  const loadNext = useCallback(async () => {
    setResult(null);
    const res = await fetch("/api/practice/listen");
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.text) {
      setRound(null);
      setError(
        res.status === 401
          ? { text: "Сонсох дадлага хийхийн тулд эхлээд нэвтэрнэ үү.", needsSignIn: true }
          : { text: data.error || "Дадлага ачаалахад алдаа гарлаа. Дахин оролдоно уу." }
      );
      return;
    }
    setError(null);
    setRound(data);
  }, []);

  // Нэвтэрсэн даруйд (modal-аар) хуудсыг сэргээхгүйгээр дахин ачаална.
  useEffect(() => {
    if (isLoaded) loadNext();
  }, [isLoaded, isSignedIn, loadNext]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="page-title">🎧 Listen — Сонсох дадлага</h1>
        <p className="page-subtitle">
          Санамсаргүй сонгосон 5 тэмдэгтийн морзын дууг сонсоод бичнэ үү.
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto card p-6 text-center space-y-3">
          <p className="text-2xl">🔒</p>
          <p className="text-ink/70">{error.text}</p>
          {error.needsSignIn && (
            <SignInButton mode="modal">
              <button className="btn-accent">Нэвтрэх</button>
            </SignInButton>
          )}
        </div>
      )}

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
