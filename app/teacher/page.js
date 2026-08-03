"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";

// Багшийн удирдлагын самбар: Видео хичээл оруулах, Шалгалтын асуулт оруулах,
// Сурагч нэмэх (spec §2 permissions: Teacher only). Эрхийн шалгалтыг
// API талд (requireRole) хийдэг тул энд UI-г л харуулна.
export default function TeacherDashboardPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-darker">Багшийн самбар</h1>
      <LessonUploadForm />
      <ExamQuestionForm />
      <StudentAddForm />
    </div>
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
    setStatus(res.ok ? "Хичээл нэмэгдлээ." : "Алдаа гарлаа.");
    if (res.ok) setForm({ title: "", videoUrl: "", description: "" });
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-3">
      <h2 className="font-bold">Хичээл (Видео) Upload</h2>
      {status && <p className="text-sm">{status}</p>}
      <input
        placeholder="Гарчиг"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full border border-surface rounded-md px-3 py-2"
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
        className="w-full border border-surface rounded-md px-3 py-2"
      />
      <textarea
        placeholder="Тайлбар"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full border border-surface rounded-md px-3 py-2"
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
    setStatus(res.ok ? "Асуулт нэмэгдлээ." : "Алдаа гарлаа.");
    if (res.ok) setForm({ type: "write", text: "" });
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-3">
      <h2 className="font-bold">Шалгалтын асуулт оруулах</h2>
      {status && <p className="text-sm">{status}</p>}
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        className="w-full border border-surface rounded-md px-3 py-2"
      >
        <option value="write">Write</option>
        <option value="listen">Listen</option>
      </select>
      <input
        placeholder="Текст"
        value={form.text}
        onChange={(e) => setForm({ ...form, text: e.target.value })}
        className="w-full border border-surface rounded-md px-3 py-2"
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
    setStatus(res.ok ? "Сурагч нэмэгдлээ." : "Алдаа гарлаа.");
    if (res.ok) setForm({ studentId: "", group: "" });
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-3">
      <h2 className="font-bold">Сурагч нэмэх</h2>
      {status && <p className="text-sm">{status}</p>}
      <input
        placeholder="Сурагчийн User ID (MongoDB _id)"
        value={form.studentId}
        onChange={(e) => setForm({ ...form, studentId: e.target.value })}
        className="w-full border border-surface rounded-md px-3 py-2"
      />
      <input
        placeholder="Бүлэг (жишээ: 2026-01)"
        value={form.group}
        onChange={(e) => setForm({ ...form, group: e.target.value })}
        className="w-full border border-surface rounded-md px-3 py-2"
      />
      <button className="btn-primary">Нэмэх</button>
    </form>
  );
}
