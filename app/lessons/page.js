"use client";

import { useEffect, useState } from "react";

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

  if (error) return <p className="text-red-700">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-darker">Хичээлүүд</h1>
      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <div key={lesson._id} className="card p-4">
            <h2 className="font-semibold">{lesson.title}</h2>
            <p className="text-sm text-ink/60 mb-2">
              Багш: {lesson.teacherId?.nickname || "—"}
            </p>
            <video src={lesson.videoUrl} controls className="w-full rounded-md" />
            <p className="text-sm text-ink/70 mt-2">{lesson.description}</p>
          </div>
        ))}
        {lessons.length === 0 && (
          <p className="text-ink/60 text-sm">Одоогоор хичээл алга байна.</p>
        )}
      </div>
    </div>
  );
}
