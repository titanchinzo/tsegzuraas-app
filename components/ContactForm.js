"use client";

import { useState } from "react";

const FIELD =
  "px-3.5 py-2 rounded-md text-slate-900 bg-white/95 border border-white/10 placeholder:text-slate-400 focus:bg-white focus-visible:outline-white/60 transition-colors text-sm";

// Footer-ийн "Захидал илгээх" форм. Өмнө нь onSubmit байгаагүй тул хуудсыг
// дахин ачаалаад зурвас хаашаа ч очдоггүй байв.
export default function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // ботод зориулсан нуугдмал талбар
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { ok, text }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setEmail("");
        setMessage("");
        setStatus({ ok: true, text: "Зурвас илгээгдлээ. Баярлалаа!" });
      } else {
        setStatus({ ok: false, text: data.error || "Илгээж чадсангүй. Дахин оролдоно уу." });
      }
    } catch {
      setStatus({ ok: false, text: "Сүлжээний алдаа. Дахин оролдоно уу." });
    }
    setSending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <input
        type="email"
        name="email"
        required
        maxLength={200}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Таны и-мэйл"
        className={FIELD}
      />
      <textarea
        name="message"
        required
        maxLength={2000}
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Зурвас..."
        className={`${FIELD} resize-none`}
      />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
      />
      <button type="submit" disabled={sending} className="btn-accent w-fit !px-4 !py-2">
        {sending ? "Илгээж байна..." : "Илгээх"}
      </button>
      {status && (
        <p role="status" className={`text-xs ${status.ok ? "text-accent-light" : "text-red-300"}`}>
          {status.text}
        </p>
      )}
    </form>
  );
}
