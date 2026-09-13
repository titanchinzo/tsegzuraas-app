"use client";

import { useEffect, useState } from "react";
import FileUpload from "@/components/FileUpload";
import LessonVideo from "@/components/LessonVideo";
import { formatInGroups } from "@/lib/morse";

// Багшийн удирдлагын самбар: Видео хичээл оруулах/устгах, Шалгалтын асуулт
// оруулах, Сурагч нэмэх/хасах (spec §2 permissions: Teacher only). Эрхийн
// шалгалтыг API талд (requireRole) хийдэг тул энд UI-г л харуулна.
export default function TeacherDashboardPage() {
  return (
    <div className="space-y-10 max-w-2xl mx-auto animate-fade-in">
      <h1 className="page-title">🧑‍🏫 Багшийн самбар</h1>
      <LessonManagement />
      <ExamQuestionManagement />
      <ListenSettingsForm
        scope="score"
        title="Score хуудасны Listen дуу"
        description="Score хуудасны Write/Listen Exam (random, rank-той) дээр ашиглагдана. Teacher Listen-ээс бүрэн тусдаа. Тэмдэгтийг радио дуудлагын хэвшлээр 5-аар нь бүлэглэж тоглуулна."
        showSecondsPerGroup={false}
      />
      <ListenSettingsForm
        scope="teacher"
        title="Teacher Listen дуу"
        description="Lessons дотрох Teacher Listen шалгалт дээр ашиглагдана. Score/Listen-ээс бүрэн тусдаа. Бүлэг тус бүрийг автоматаар тоглуулж, доорх хугацаанд бичүүлнэ."
        showSecondsPerGroup
      />
      <StudentManagement />
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

function LessonManagement() {
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ title: "", videoUrl: "", description: "" });
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function loadLessons() {
    const res = await fetch("/api/lessons");
    if (res.ok) {
      const data = await res.json();
      setLessons(data.lessons || []);
    }
  }

  useEffect(() => {
    loadLessons();
  }, []);

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? { ok: true, text: "Хичээл нэмэгдлээ." } : { ok: false, text: "Алдаа гарлаа." });
    if (res.ok) {
      setForm({ title: "", videoUrl: "", description: "" });
      loadLessons();
    }
  }

  async function deleteLesson(id) {
    if (!confirm("Энэ хичээлийг устгах уу?")) return;
    await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    loadLessons();
  }

  return (
    <section className="space-y-4">
      <h2 className="font-bold text-brand-darker">Миний хичээлүүд</h2>

      <form onSubmit={submit} className="card p-6 space-y-3">
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
          onBusyChange={setUploading}
          onUploaded={(url) => setForm((f) => ({ ...f, videoUrl: url }))}
        />
        <input
          placeholder="YouTube линк эсвэл видео URL"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          className="input"
        />

        {form.videoUrl.trim() && (
          <div className="space-y-1.5">
            <p className="label">Урьдчилан харах</p>
            <LessonVideo url={form.videoUrl} title={form.title} />
          </div>
        )}
        <textarea
          placeholder="Тайлбар"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input"
          rows={3}
        />
        <button className="btn-primary" disabled={uploading}>
          {uploading ? "Видео хуулж байна..." : "Нэмэх"}
        </button>
      </form>

      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div key={lesson._id} className="card p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-ink/90 truncate">{lesson.title}</p>
              <p className="text-sm text-ink/50 truncate">{lesson.description || "—"}</p>
            </div>
            <button
              onClick={() => deleteLesson(lesson._id)}
              className="shrink-0 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Устгах
            </button>
          </div>
        ))}
        {lessons.length === 0 && (
          <div className="card p-10 text-center text-ink/50 text-sm">
            Одоогоор хичээл алга байна.
          </div>
        )}
      </div>
    </section>
  );
}

function ExamQuestionManagement() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ type: "write", text: "" });
  const [status, setStatus] = useState(null);

  async function loadQuestions() {
    const res = await fetch("/api/exam/questions");
    if (res.ok) {
      const data = await res.json();
      setQuestions(data.questions || []);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/exam/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? { ok: true, text: "Нэмэгдлээ." } : { ok: false, text: "Алдаа гарлаа." });
    if (res.ok) {
      setForm({ type: form.type, text: "" });
      loadQuestions();
    }
  }

  async function deleteQuestion(id) {
    if (!confirm("Энэ агуулгыг устгах уу?")) return;
    await fetch(`/api/exam/questions/${id}`, { method: "DELETE" });
    loadQuestions();
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-bold text-brand-darker">Шалгалтын агуулга (Teacher Write/Listen)</h2>
        <p className="text-sm text-ink/50 mt-1">
          Энд оруулсан текстээс санамсаргүй сонгож "Teacher Write/Listen"
          шалгалтад өгнө — random Write/Listen Exam-тай (rank-тай) огт
          хамааралгүй, зөвхөн таны сурагчид (Миний сурагчид хэсэгт нэмсэн)
          үзнэ. Бичих явцад 5 тэмдэгт болгонд автоматаар зай авна.
        </p>
      </div>

      <form onSubmit={submit} className="card p-6 space-y-3">
        <StatusMessage status={status} />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="input"
        >
          <option value="write">Write</option>
          <option value="listen">Listen</option>
        </select>
        <textarea
          placeholder="Тэмдэгтүүд (жиш: K3XQP N8ZRT L5MWY...) — бичих явцад 5-аар автоматаар зайлна"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: formatInGroups(e.target.value, 5) })}
          className="input font-mono"
          rows={4}
        />
        <button className="btn-primary">Нэмэх</button>
      </form>

      <div className="space-y-2">
        {questions.map((q) => (
          <div key={q._id} className="card p-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex items-center gap-3">
              <span className="badge-brand shrink-0">{q.type}</span>
              <span className="font-mono text-ink/90 truncate">{q.text}</span>
            </div>
            <button
              onClick={() => deleteQuestion(q._id)}
              className="shrink-0 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Устгах
            </button>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="card p-10 text-center text-ink/50 text-sm">
            Одоогоор шалгалтын агуулга алга байна.
          </div>
        )}
      </div>
    </section>
  );
}

// scope="score" -> Score хуудасны random Listen; scope="teacher" -> Teacher
// Listen. Хоёр нь бүрэн тусдаа тохиргоотой (нэгийг өөрчлөхөд нөгөө хөндөгдөхгүй).
function ListenSettingsForm({ scope, title, description, showSecondsPerGroup }) {
  const [wpm, setWpm] = useState(20);
  const [frequency, setFrequency] = useState(600);
  const [secondsPerGroup, setSecondsPerGroup] = useState(6);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/exam/settings?scope=${scope}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setWpm(data.wpm);
        setFrequency(data.frequency);
        setSecondsPerGroup(data.secondsPerGroup);
      });
  }, [scope]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/exam/settings?scope=${scope}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wpm, frequency, secondsPerGroup }),
    });
    setStatus(res.ok ? { ok: true, text: "Хадгалагдлаа." } : { ok: false, text: "Алдаа гарлаа." });
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="card p-6 space-y-4">
      <div>
        <h2 className="font-bold text-brand-darker">{title}</h2>
        <p className="text-sm text-ink/50 mt-1">{description}</p>
      </div>
      <StatusMessage status={status} />

      <label className="flex flex-col gap-1.5 text-sm text-ink/70">
        Хурд (WPM): <span className="font-semibold text-brand-darker">{wpm}</span>
        <input
          type="range"
          min="5"
          max="40"
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          className="accent-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-ink/70">
        Өнгө (Hz): <span className="font-semibold text-brand-darker">{frequency} Hz</span>
        <input
          type="range"
          min="300"
          max="1000"
          step="10"
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
          className="accent-accent"
        />
      </label>

      {showSecondsPerGroup && (
        <label className="flex flex-col gap-1.5 text-sm text-ink/70">
          Бүлэг тус бүрд өгөх хугацаа:{" "}
          <span className="font-semibold text-brand-darker">{secondsPerGroup}с</span>
          <input
            type="range"
            min="2"
            max="30"
            value={secondsPerGroup}
            onChange={(e) => setSecondsPerGroup(Number(e.target.value))}
            className="accent-accent"
          />
        </label>
      )}

      <button className="btn-primary" disabled={saving}>
        {saving ? "Хадгалж байна..." : "Хадгалах"}
      </button>
    </form>
  );
}

function StudentManagement() {
  const [roster, setRoster] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [group, setGroup] = useState("");
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadRoster() {
    const res = await fetch("/api/users/students");
    if (res.ok) {
      const data = await res.json();
      setRoster(data.students || []);
    }
  }

  async function loadAllStudents() {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setAllStudents(data.users || []);
    }
  }

  useEffect(() => {
    loadRoster();
    loadAllStudents();
  }, []);

  const rosterIds = new Set(roster.map((r) => String(r.studentId?._id || r.studentId)));
  const available = allStudents.filter((u) => !rosterIds.has(String(u._id)));

  async function addStudent(e) {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    const res = await fetch("/api/users/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: selectedId, group }),
    });
    setStatus(res.ok ? { ok: true, text: "Сурагч нэмэгдлээ." } : { ok: false, text: "Алдаа гарлаа." });
    setSaving(false);
    if (res.ok) {
      setSelectedId("");
      setGroup("");
      loadRoster();
    }
  }

  async function removeStudent(studentId) {
    if (!confirm("Энэ сурагчийг жагсаалтаас хасах уу?")) return;
    await fetch(`/api/users/students?studentId=${studentId}`, { method: "DELETE" });
    loadRoster();
  }

  return (
    <section className="space-y-4">
      <h2 className="font-bold text-brand-darker">Миний сурагчид</h2>
      <p className="text-sm text-ink/50 -mt-2">
        Зөвхөн энд нэмсэн сурагчид таны хичээлийг үзэх боломжтой.
      </p>

      <form onSubmit={addStudent} className="card p-6 space-y-3">
        <StatusMessage status={status} />
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="input"
          required
        >
          <option value="">Сурагч сонгох...</option>
          {available.map((u) => (
            <option key={u._id} value={u._id}>
              {u.nickname}
              {u.email ? ` (${u.email})` : ""}
            </option>
          ))}
        </select>
        <input
          placeholder="Бүлэг (заавал биш, ж: 2026-01)"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="input"
        />
        <button className="btn-primary" disabled={saving || !selectedId}>
          Нэмэх
        </button>
        {available.length === 0 && allStudents.length > 0 && (
          <p className="text-xs text-ink/40">Бүх сурагч аль хэдийн нэмэгдсэн байна.</p>
        )}
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-surface text-ink/40">
              <th className="py-3 px-5 font-medium">Nickname</th>
              <th className="font-medium">И-мэйл</th>
              <th className="font-medium">Бүлэг</th>
              <th className="font-medium px-5"></th>
            </tr>
          </thead>
          <tbody>
            {roster.map((r) => (
              <tr key={r._id} className="border-b border-surface/60 last:border-0">
                <td className="py-3 px-5 font-medium text-ink/90">
                  {r.studentId?.nickname || "—"}
                </td>
                <td className="text-ink/50">{r.studentId?.email || "—"}</td>
                <td className="text-ink/50">{r.group || "—"}</td>
                <td className="px-5 text-right">
                  <button
                    onClick={() => removeStudent(r.studentId?._id || r.studentId)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Хасах
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roster.length === 0 && (
          <p className="text-ink/50 text-sm p-6 text-center">Сурагч одоогоор алга байна.</p>
        )}
      </div>
    </section>
  );
}
