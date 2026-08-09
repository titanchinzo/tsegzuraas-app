"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, RotateCcw, Star, Volume2 } from "lucide-react";
import { MORSE_MAP, textToMorse } from "@/lib/morse";
import { playChar } from "@/lib/audio";
import { getLesson, getNextLesson, starsFor } from "@/lib/studyLessons";
import { saveLessonResult } from "@/lib/studyProgress";
import MorseEncodeTrainer, { commitGapMs } from "@/components/MorseEncodeTrainer";

const WPM_KEY = "tsegzuraas.study.wpm";

// Тэмдэгтийн хичээлд санамсаргүй дараалал үүсгэнэ; ижил тэмдэгт дараалан
// 3-аас олон удаа гарахаас сэргийлнэ. Үгийн хичээлд үгсийг нь холино.
function buildSequence(lesson) {
  if (lesson.words) {
    return [...lesson.chars].sort(() => Math.random() - 0.5);
  }

  const out = [];
  let streak = 0;

  for (let i = 0; i < lesson.length; i++) {
    let pick;
    do {
      pick = lesson.chars[Math.floor(Math.random() * lesson.chars.length)];
    } while (lesson.chars.length > 1 && pick === out[out.length - 1] && streak >= 2);

    streak = pick === out[out.length - 1] ? streak + 1 : 0;
    out.push(pick);
  }
  return out;
}

export default function LessonPage() {
  const { lessonId } = useParams();
  const lesson = getLesson(lessonId);

  const [attempt, setAttempt] = useState(0); // дахин эхлэхэд trainer-ийг шинэчилнэ
  const [summary, setSummary] = useState(null);
  const [sequence, setSequence] = useState(null);
  const [wpm, setWpm] = useState(12);

  // Дарааллыг зөвхөн клиент дээр үүсгэнэ. Render дотор Math.random() дуудвал
  // сервер, клиент хоёр өөр тэмдэгт гаргаж hydration зөрчил үүсгэдэг.
  useEffect(() => {
    if (!lesson) return;
    setSequence(buildSequence(lesson));
  }, [lesson, attempt]);

  // Сонгосон хурдыг хичээл хооронд санана.
  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(WPM_KEY));
      if (saved >= 5 && saved <= 40) setWpm(saved);
    } catch {
      /* localStorage байхгүй бол анхдагч хурдаар үлдэнэ */
    }
  }, []);

  function changeWpm(value) {
    setWpm(value);
    try {
      window.localStorage.setItem(WPM_KEY, String(value));
    } catch {
      /* хадгалж чадахгүй бол зөвхөн энэ хичээлд үйлчилнэ */
    }
  }

  const handleFinish = useCallback(
    (res) => {
      const stars = starsFor(res.accuracy);
      saveLessonResult(lesson.id, { stars, accuracy: res.accuracy });
      setSummary({ ...res, stars });
    },
    [lesson]
  );

  if (!lesson) {
    return (
      <div className="mx-auto max-w-md card p-6 text-center space-y-3 animate-fade-in">
        <p className="text-2xl">🤔</p>
        <p className="text-ink/70">Ийм хичээл олдсонгүй.</p>
        <Link href="/study" className="btn-primary">
          Study руу буцах
        </Link>
      </div>
    );
  }

  const next = getNextLesson(lesson.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <Link
        href="/study"
        className="inline-flex items-center gap-1.5 text-sm text-ink/50 transition-colors hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Study
      </Link>

      <div>
        <p className="label">Хичээл {lesson.num}</p>
        <h1 className="page-title">{lesson.title}</h1>
      </div>

      {/* Хурд: автоматаар илгээх завсар болон дууны хурдыг хоёуланг тохируулна */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="label">Хурд</p>
          <p className="text-sm text-ink/55">
            <strong className="text-brand-darker">{wpm} WPM</strong> &middot; түр зогсоод{" "}
            {commitGapMs(wpm)}ms болмогц илгээнэ
          </p>
        </div>
        <input
          type="range"
          min="5"
          max="40"
          value={wpm}
          onChange={(e) => changeWpm(Number(e.target.value))}
          aria-label="Хурд (WPM)"
          className="w-44 accent-accent"
        />
      </div>

      {/* Энэ хичээлийн тэмдэгтүүд — сонсож болно */}
      <div className="card p-4">
        <p className="label mb-2.5">
          {lesson.words ? "Энэ хичээлийн үг" : "Энэ хичээлийн тэмдэгт"}
        </p>
        <div className="flex flex-wrap gap-2">
          {lesson.chars.map((c) => {
            // Үгийн хичээлд MORSE_MAP["THE"] байхгүй тул бүтэн үгийг хөрвүүлнэ.
            const code = lesson.words ? textToMorse(c) : MORSE_MAP[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => playChar(code, wpm)}
                title="Дуугаар сонсох"
                className="group flex items-center gap-2 rounded-lg border border-surface bg-surface-light px-3 py-1.5 transition-colors hover:border-brand-300"
              >
                <span className="font-bold text-brand-darker">{c}</span>
                <span className="font-mono text-sm text-ink/50">{code}</span>
                <Volume2 className="h-3.5 w-3.5 text-ink/25 transition-colors group-hover:text-accent-dark" />
              </button>
            );
          })}
        </div>
      </div>

      {summary ? (
        <div className="card space-y-4 p-6 text-center">
          <div className="flex justify-center gap-1">
            {[1, 2, 3].map((i) => (
              <Star
                key={i}
                className={`h-9 w-9 ${
                  i <= summary.stars ? "fill-accent text-accent" : "fill-transparent text-ink/20"
                }`}
              />
            ))}
          </div>

          <div>
            <p className="text-3xl font-bold text-brand-darker">{summary.accuracy}%</p>
            <p className="text-sm text-ink/55">
              {summary.correct} / {summary.total} зөв &middot;{" "}
              {summary.durationSeconds.toFixed(0)} сек
            </p>
          </div>

          {/* Алдсан тэмдэгтүүдийг зөв кодтой нь харуулна */}
          {summary.results.some((r) => !r.correct) && (
            <div className="rounded-lg border border-surface bg-surface-light p-3 text-left">
              <p className="label mb-2">Алдсан тэмдэгт</p>
              <ul className="space-y-1 text-sm">
                {summary.results
                  .map((r, i) => ({ ...r, i }))
                  .filter((r) => !r.correct)
                  .map((r) => (
                    <li key={r.i} className="flex items-center gap-2">
                      <span className="w-5 font-bold text-brand-darker">{r.char}</span>
                      <span className="font-mono text-green-700 dark:text-green-400">
                        {MORSE_MAP[r.char]}
                      </span>
                      <span className="text-ink/30">←</span>
                      <span className="font-mono text-red-600 dark:text-red-400">
                        {r.input || "—"}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setSummary(null);
                setAttempt((a) => a + 1);
              }}
              className="btn-secondary"
            >
              <RotateCcw className="h-4 w-4" />
              Дахин
            </button>
            {next ? (
              <Link href={`/study/${next.id}`} className="btn-primary">
                Дараагийн хичээл
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/study" className="btn-primary">
                Бүх хичээл дууслаа 🎉
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-6">
          {sequence ? (
            <MorseEncodeTrainer
              key={attempt}
              items={sequence}
              wpm={wpm}
              onFinish={handleFinish}
            />
          ) : (
            <div className="h-64 animate-pulse rounded-lg bg-surface-light" />
          )}
        </div>
      )}
    </div>
  );
}
