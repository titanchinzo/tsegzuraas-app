"use client";

import { useRef, useState } from "react";

export default function FileUpload({ accept, onUploaded, label = "Файл хуулах" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error || "Хуулахад алдаа гарлаа.");
      return;
    }
    onUploaded?.(data.url);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-1">
      <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-brand-darker hover:underline">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
        <span className="border border-surface rounded-md px-3 py-1.5 bg-surface-light">
          {uploading ? "Хуулж байна..." : label}
        </span>
      </label>
      {error && <p className="text-red-700 text-xs">{error}</p>}
    </div>
  );
}
