"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import ListenTrainer from "@/components/ListenTrainer";
import ResultPanel from "@/components/ResultPanel";
import AlphabetToggle, { MongolTypingHint } from "@/components/AlphabetToggle";
import useAlphabet from "@/lib/useAlphabet";

export default function ListenPracticePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [alphabet, setAlphabet, alphabetReady] = useAlphabet();
  const requestRef = useRef(0);
  const [round, setRound] = useState(null); // { text, morse }
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // { text, needsSignIn }

  // API нь нэвтрээгүй үед { error } буцаадаг. Өмнө нь түүнийг шууд round
  // болгож, ListenTrainer-т target=undefined очоод хуудас бүхэлдээ унадаг байв.
  const loadNext = useCallback(async () => {
    setResult(null);
    // Горимыг хурдан солиход хуучин хүсэлтийн хариу шинийг дарахгүй.
    const id = ++requestRef.current;
    const res = await fetch(`/api/practice/listen?alphabet=${alphabet}`);
    const data = await res.json().catch(() => ({}));
    if (id !== requestRef.current) return;
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
  }, [alphabet]);

  // Нэвтэрсэн даруйд (modal-аар) эсвэл горим солиход хуудсыг сэргээхгүйгээр
  // дахин ачаална.
  useEffect(() => {
    if (isLoaded && alphabetReady) loadNext();
  }, [isLoaded, isSignedIn, alphabetReady, loadNext]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="page-title">🎧 Listen — Сонсох дадлага</h1>
        <p className="page-subtitle">
          Санамсаргүй сонгосон 5 тэмдэгтийн морзын дууг сонсоод бичнэ үү.
        </p>
      </div>

      <div className="space-y-2">
        <AlphabetToggle value={alphabet} onChange={setAlphabet} />
        <MongolTypingHint alphabet={alphabet} />
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
