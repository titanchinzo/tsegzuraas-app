"use client";

import { VideoOff } from "lucide-react";
import { parseVideoSource } from "@/lib/video";

/**
 * Хичээлийн видео плеер. YouTube линкийг iframe-ээр, шууд файлын линкийг
 * (Cloudinary г.м) <video> тагаар тоглуулна.
 */
export default function LessonVideo({ url, title }) {
  const source = parseVideoSource(url);

  if (source.kind === "youtube") {
    const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
    if (source.start) params.set("start", String(source.start));

    return (
      // aspect-video-той сав ашиглан ямар ч өргөнд 16:9 харьцаа хадгална.
      <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-brand-900">
        <iframe
          // nocookie домэйн нь хэрэглэгч тоглуулах хүртэл мөшгих күүки тавихгүй.
          src={`https://www.youtube-nocookie.com/embed/${source.id}?${params}`}
          title={title || "Видео хичээл"}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  if (source.kind === "file") {
    return (
      <video
        src={url}
        controls
        preload="metadata"
        className="w-full aspect-video rounded-lg bg-brand-900"
      />
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-surface bg-surface-light px-4 text-center">
      <VideoOff className="h-6 w-6 text-ink/30" />
      <p className="text-sm text-ink/50">
        {source.kind === "empty" ? "Видео хавсаргаагүй байна." : "Видео линк буруу байна."}
      </p>
    </div>
  );
}
