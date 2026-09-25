"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Zap, Table2, RotateCcw } from "lucide-react";
import { MORSE_MAP } from "@/lib/morse";
import { SECTIONS, LESSONS } from "@/lib/studyLessons";
import { loadProgress, summarize, resetProgress } from "@/lib/studyProgress";

function Stars({ count, size = "h-3 w-3" }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={`${size} ${
            i <= count ? "fill-accent text-accent" : "fill-transparent text-ink/20"
          }`}
          strokeWidth={2}
        />
      ))}
    </span>
  );
}

function LessonCard({ lesson, stars, isNext }) {
  return (
    <Link
      href={`/study/${lesson.id}`}
      className={`card card-hover relative flex flex-col gap-2 p-3 ${
        isNext ? "ring-2 ring-accent" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold tabular-nums text-ink/35">{lesson.num}</span>
        {isNext && <span className="text-[10px] font-bold uppercase text-accent-dark">Эхлэх</span>}
      </div>

      <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 py-1">
        {/* Үгийн хичээлд MORSE_MAP[үг] байхгүй тул зөвхөн үгсийг харуулна. */}
        {lesson.words
          ? lesson.chars.slice(0, 2).map((w) => (
              <span key={w} className="text-sm font-bold leading-tight text-brand-darker">
                {w}
              </span>
            ))
          : lesson.chars.slice(0, 4).map((c) => (
              <span key={c} className="text-center">
                <span className="block text-sm font-bold leading-none text-brand-darker">{c}</span>
                <span className="block font-mono text-[10px] leading-tight text-ink/40">
                  {MORSE_MAP[c]}
                </span>
              </span>
            ))}
        {lesson.chars.length > (lesson.words ? 2 : 4) && (
          <span className="text-xs font-semibold text-ink/40">
            +{lesson.chars.length - (lesson.words ? 2 : 4)}
          </span>
        )}
      </div>

      <p className="truncate text-center text-xs text-ink/60" title={lesson.title}>
        {lesson.title}
      </p>

      <div className="flex justify-center">
        <Stars count={stars} />
      </div>
    </Link>
  );
}

export default function StudyPage() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  // Сервер талд localStorage байхгүй тул эхний render-т явцыг 0 гэж үзнэ.
  const p = progress || {};
  const summary = summarize(p, LESSONS);
  const nextLesson = LESSONS.find((l) => !p[l.id]?.stars);

  function handleReset() {
    resetProgress();
    setProgress({});
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">📖 Study — Морзын код</h1>
        <p className="page-subtitle">
          Хичээл дараалан үзэж, тэмдэгт бүрийг цэг зураасаар кодлох дадлага хийнэ.
        </p>
      </div>

      {/* Ерөнхий явц */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="label">Гүйцэтгэл</p>
              <p className="text-2xl font-bold text-brand-darker">{summary.percent}%</p>
            </div>
            <div>
              <p className="label">Од</p>
              <p className="flex items-center gap-1.5 text-2xl font-bold text-brand-darker">
                <Star className="h-5 w-5 fill-accent text-accent" />
                {summary.stars}
                <span className="text-sm font-medium text-ink/40">/ {summary.maxStars}</span>
              </p>
            </div>
            <div>
              <p className="label">Хичээл</p>
              <p className="text-2xl font-bold text-brand-darker">
                {summary.done}
                <span className="text-sm font-medium text-ink/40"> / {summary.total}</span>
              </p>
            </div>
          </div>

          {summary.done > 0 && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-ink/40 transition-colors hover:text-red-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Явцыг тэглэх
            </button>
          )}
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${summary.percent}%` }}
          />
        </div>
      </div>

      {/* Гар халаалт + хүснэгт */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/study/warmup"
          className="card card-hover flex items-center gap-4 p-5 group"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-dark">
            <Zap className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block font-bold text-brand-darker group-hover:text-accent-dark transition-colors">
              Гар халаалт
            </span>
            <span className="block text-sm text-ink/55">
              Үсгийг морзоор бичиж мангас, боссуудыг ял.
            </span>
          </span>
        </Link>

        <Link href="/study/table" className="card card-hover flex items-center gap-4 p-5 group">
          {/* brand-100 нь хоёр горимд цайвар хэвээр тул дүрсэнд тогтмол бараан
              өнгө өгнө — brand-darker нь dark горимд цайвар болж алга болдог. */}
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-900">
            <Table2 className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block font-bold text-brand-darker group-hover:text-accent-dark transition-colors">
              Кодын хүснэгт
            </span>
            <span className="block text-sm text-ink/55">
              Бүх тэмдэгтийн код, дуугаар сонсох.
            </span>
          </span>
        </Link>
      </div>

      {/* Хичээлүүд */}
      {SECTIONS.map((section) => (
        <section key={section.id} className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-brand-darker">{section.title}</h2>
            <p className="text-sm text-ink/50">{section.hint}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {section.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                stars={p[lesson.id]?.stars || 0}
                isNext={nextLesson?.id === lesson.id}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
