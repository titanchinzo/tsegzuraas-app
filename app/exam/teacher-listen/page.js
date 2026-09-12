"use client";

import { useEffect, useState } from "react";
import { groupChars } from "@/lib/morse";
import TeacherListenExam from "@/components/TeacherListenExam";
import ResultPanel from "@/components/ResultPanel";

// Багшийн Listen шалгалт: Random Listen Exam-тай (rank/leaderboard-той) ЯГ
// ХОЛБООГҮЙ тусдаа систем. Тухайн сурагчийн багшийн ExamQuestion сангаас
// нэг бүтэн текстийг татаж, 5-аар бүлэглэн, бүлэг тус бүрийг дараалан
// тоглуулж, багшийн тохируулсан хугацаанд бичүүлнэ.
export default function TeacherListenExamPage() {
  const [groups, setGroups] = useState(null);
  const [settings, setSettings] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/exam/teacher-round?type=listen").then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setError("Шалгалт өгөхийн тулд эхлээд нэвтэрнэ үү.");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Шалгалт ачаалахад алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }
      setGroups(groupChars(data.text, 5));
    });

    fetch("/api/exam/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then(setSettings)
      .catch(() => {});
  }, []);

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

  if (!groups || !settings) {
    return <p className="text-ink/50 text-center">Ачааллаж байна...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <h1 className="page-title">Teacher Listen</h1>
      <TeacherListenExam
        groups={groups}
        wpm={settings.wpm}
        frequency={settings.frequency}
        secondsPerGroup={settings.secondsPerGroup}
        onComplete={setFinalResult}
      />
    </div>
  );
}
