"use client";

import { useEffect, useState } from "react";
import LessonVideo from "@/components/LessonVideo";

// Хичээл (Lesson) үзэх — Teacher, Student эрхтэй (spec §2 permissions table)
export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/lessons")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error);
        return r.json();
      })
      .then((d) => setLessons(d.lessons || []))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="max-w-md mx-auto card p-6 text-center space-y-2 animate-fade-in">
        <p className="text-2xl">🔒</p>
        <p className="text-ink/70">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">🎓 Хичээлүүд</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink/40">Багшийн шалгалт</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/exam/teacher-write" className="card card-hover p-5 block">
            <span className="font-bold text-brand-darker">✍️ Teacher Write</span>
            <p className="text-sm text-ink/55 mt-1">Багшийн өгсөн текстийг түлхүүрээр кодлох шалгалт.</p>
          </a>
          <a href="/exam/teacher-listen" className="card card-hover p-5 block">
            <span className="font-bold text-brand-darker">🎧 Teacher Listen</span>
            <p className="text-sm text-ink/55 mt-1">Багшийн өгсөн текстийг сонсож бичих шалгалт.</p>
          </a>
        </div>
      </section>

      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <div key={lesson._id} className="card p-5">
            <h2 className="font-semibold text-brand-darker">{lesson.title}</h2>
            <p className="text-sm text-ink/50 mb-3">
              Багш: {lesson.teacherId?.nickname || "—"}
            </p>
            <LessonVideo url={lesson.videoUrl} title={lesson.title} />
            <p className="text-sm text-ink/70 mt-3 leading-relaxed">{lesson.description}</p>
          </div>
        ))}
        {lessons.length === 0 && (
          <div className="card p-10 text-center text-ink/50 text-sm">
            Одоогоор хичээл алга байна.
          </div>
        )}
      </div>
    </div>
  );
}
