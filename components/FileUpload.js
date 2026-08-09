"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, X, Check, FileVideo, FileImage, Loader2 } from "lucide-react";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Файл хуулах компонент — байт түвшний бодит прогресс бартай.
 *
 * Урсгал: (1) сервэрээс гарын үсэг авах → (2) браузер Cloudinary руу ШУУД
 * XHR-ээр илгээх → (3) Cloudinary боловсруулж дуустал хүлээх.
 *
 * fetch() нь upload-ын явцыг мэдэгдэх боломжгүй тул XMLHttpRequest ашиглав —
 * зөвхөн xhr.upload.onprogress л илгээгдсэн байтын тоог өгдөг.
 */
export default function FileUpload({
  accept,
  onUploaded,
  onBusyChange,
  label = "Файл хуулах",
}) {
  const inputRef = useRef(null);
  const xhrRef = useRef(null);

  const [phase, setPhase] = useState("idle"); // idle | signing | uploading | processing | done
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(null);

  const busy = phase === "signing" || phase === "uploading" || phase === "processing";

  // Компонент устахад дуусаагүй upload-ыг таслана, эс бөгөөс салсан
  // компонент дээр setState дуудагдана.
  useEffect(() => {
    return () => xhrRef.current?.abort();
  }, []);

  // Эцэг форм upload дуустал "Хадгалах"-ыг хаах боломжтой болгоно (эс бөгөөс
  // видео URL хоосон байхад хичээл хадгалагдаж, 400 алдаа өгнө).
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const reset = useCallback(() => {
    setPhase("idle");
    setLoaded(0);
    setTotal(0);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  function handleCancel() {
    xhrRef.current?.abort();
    xhrRef.current = null;
    reset();
  }

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);
    setTotal(file.size);
    setLoaded(0);
    setPhase("signing");

    // 1. Гарын үсэг авах
    let sig;
    try {
      const res = await fetch("/api/upload/signature", { method: "POST" });
      sig = await res.json();
      if (!res.ok) {
        setError(sig.error || "Гарын үсэг авахад алдаа гарлаа.");
        reset();
        return;
      }
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
      reset();
      return;
    }

    // 2. Cloudinary руу шууд илгээх
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", sig.timestamp);
    form.append("folder", sig.folder);
    form.append("signature", sig.signature);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", sig.uploadUrl);

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      setLoaded(evt.loaded);
      setTotal(evt.total);
      // Бүх байт илгээгдсэн ч Cloudinary тал боловсруулж дуусаагүй байдаг тул
      // 100%-д хүрмэгц "боловсруулж байна" төлөвт шилжинэ.
      setPhase(evt.loaded >= evt.total ? "processing" : "uploading");
    };

    xhr.onload = () => {
      xhrRef.current = null;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setPhase("done");
          onUploaded?.(data.secure_url);
        } catch {
          setError("Cloudinary-аас буруу хариу ирлээ.");
          reset();
        }
      } else {
        let msg = "Хуулахад алдаа гарлаа.";
        try {
          msg = JSON.parse(xhr.responseText)?.error?.message || msg;
        } catch {
          /* хариу JSON биш бол ерөнхий мэдэгдэл үлдээнэ */
        }
        setError(msg);
        reset();
      }
    };

    xhr.onerror = () => {
      xhrRef.current = null;
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
      reset();
    };

    xhr.onabort = () => {
      xhrRef.current = null;
    };

    setPhase("uploading");
    xhr.send(form);
  }

  const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
  const isVideo = (accept || "").includes("video");
  const FileIcon = isVideo ? FileVideo : FileImage;

  return (
    <div className="space-y-2">
      {phase === "idle" && (
        <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <span className="inline-flex items-center gap-2 border border-dashed border-brand-300 rounded-lg px-3.5 py-2 bg-brand-50 text-brand-darker font-medium hover:bg-brand-100 hover:border-brand-400 transition-colors">
            <Upload className="w-4 h-4" />
            {label}
          </span>
        </label>
      )}

      {(busy || phase === "done") && (
        <div className="border border-surface bg-surface-light rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <FileIcon className="w-4 h-4 shrink-0 text-brand-dark" />
            <span className="text-sm font-medium text-ink/90 truncate flex-1" title={fileName}>
              {fileName}
            </span>

            {phase === "done" ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-dark shrink-0">
                <Check className="w-3.5 h-3.5" />
                Дууслаа
              </span>
            ) : (
              <span className="text-sm font-semibold tabular-nums text-brand-dark shrink-0">
                {percent}%
              </span>
            )}
          </div>

          <div
            className="h-2 w-full rounded-full bg-surface overflow-hidden"
            role="progressbar"
            aria-valuenow={phase === "done" ? 100 : percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} — явц`}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-200 ease-out ${
                // brand-dark нь харанхуй дэвсгэр дээр замтайгаа бараг ялгардаггүй
                // тул dark горимд илүү цайвар өнгө рүү шилжинэ.
                phase === "done" ? "bg-accent" : "bg-brand-dark dark:bg-brand-300"
              }`}
              style={{ width: `${phase === "done" ? 100 : percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-ink/55">
            <span className="tabular-nums">
              {phase === "signing" && "Бэлдэж байна..."}
              {phase === "uploading" && `${formatBytes(loaded)} / ${formatBytes(total)}`}
              {phase === "processing" && (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Боловсруулж байна...
                </span>
              )}
              {phase === "done" && formatBytes(total)}
            </span>

            {busy ? (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1 hover:text-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Цуцлах
              </button>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="hover:text-brand-dark transition-colors"
              >
                Өөр файл сонгох
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-700 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
