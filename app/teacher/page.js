"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";

// Багшийн удирдлагын самбар: Видео хичээл оруулах, Шалгалтын асуулт оруулах,
// Сурагч нэмэх (spec §2 permissions: Teacher only). Эрхийн шалгалтыг
// API талд (requireRole) хийдэг тул энд UI-г л харуулна.
export default function TeacherDashboardPage() {
  return (
    <div className="space-y-8 max-w-2xl animate-fade-in">
      <h1 className="page-title">🧑‍🏫 Багшийн самбар</h1>
      <LessonUploadForm />
      <ExamQuestionForm />
      <StudentAddForm />
    </div>
  );
}

function StatusMessage({ status }) {
  if (!status) return null;
  const ok = status.ok;
  return (
    <p
      className={`text-sm px-3 py-2 rounded-lg ${
        ok ? "bg-brand-50 text-brand-darker" : "bg-red-50 text-red-700"
      }`}
    >
      {ok ? "✓ " : "✕ "}
      {status.text}
    </p>
  );
}

function LessonUploadForm() {
  const [form, setForm] = useState({ title: "", videoUrl: "", description: "" });
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? { ok: true, text: "Хичээл нэмэгдлээ." } : { ok: false, text: "Алдаа гарлаа." });
    if (res.ok) setForm({ title: "", videoUrl: "", description: "" });
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-3">
      <h2 className="font-bold text-brand-darker">Хичээл (Видео) Upload</h2>
      <StatusMessage status={status} />
      <input
        placeholder="Гарчиг"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="input"
      />
      <FileUpload
        accept="video/*"
        label="Видео хуулах"
        onUploaded={(url) => setForm({ ...form, videoUrl: url })}
      />
      <input
        placeholder="Видео URL (эсвэл дээр хуулна уу)"
        value={form.videoUrl}
        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
        className="input"
      />
      <textarea
        placeholder="Тайлбар"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="input"
        rows={3}
      />
      <button className="btn-primary">Нэмэх</button>
    </form>
  );
}

function ExamQuestionForm() {
  const [form, setForm] = useState({ type: "write", text: "" });
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/exam/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? { ok: true, text: "Асуулт нэмэгдлээ." } : { ok: false, text: "Алдаа гарлаа." });
    if (res.ok) setForm({ type: "write", text: "" });
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-3">
      <h2 className="font-bold text-brand-darker">Шалгалтын асуулт оруулах</h2>
      <StatusMessage status={status} />
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        className="input"
      >
        <option value="write">Write</option>
        <option value="listen">Listen</option>
      </select>
      <input
        placeholder="Текст"
        value={form.text}
        onChange={(e) => setForm({ ...form, text: e.target.value })}
        className="input"
      />
      <button className="btn-primary">Нэмэх</button>
    </form>
  );
}

function StudentAddForm() {
  const [form, setForm] = useState({ studentId: "", group: "" });
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/users/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? { ok: true, text: "Сурагч нэмэгдлээ." } : { ok: false, text: "Алдаа гарлаа." });
    if (res.ok) setForm({ studentId: "", group: "" });
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-3">
      <h2 className="font-bold text-brand-darker">Сурагч нэмэх</h2>
      <StatusMessage status={status} />
      <input
        placeholder="Сурагчийн User ID (MongoDB _id)"
        value={form.studentId}
        onChange={(e) => setForm({ ...form, studentId: e.target.value })}
        className="input"
      />
      <input
        placeholder="Бүлэг (жишээ: 2026-01)"
        value={form.group}
        onChange={(e) => setForm({ ...form, group: e.target.value })}
        className="input"
      />
      <button className="btn-primary">Нэмэх</button>
    </form>
  );
}
