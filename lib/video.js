// Хичээлийн видео линкийг таньж, ямар плеерээр тоглуулахыг тодорхойлно.
//
// Багш нар Cloudinary руу хуулсан файлын линк эсвэл YouTube хаяг аль алиныг
// нь оруулж болно. YouTube линкийг <video> тагт хийвэл хоосон плеер гардаг
// тул iframe рүү салгаж өгөх ёстой.

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

// "90", "1m30s", "1h2m3s" зэрэг YouTube-ийн эхлэх хугацааг секунд рүү хөрвүүлнэ.
function parseStartSeconds(value) {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);

  const m = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!m) return 0;
  const [, h, min, s] = m;
  return (Number(h) || 0) * 3600 + (Number(min) || 0) * 60 + (Number(s) || 0);
}

/**
 * @returns {{kind: "youtube", id: string, start: number}
 *          | {kind: "file"}
 *          | {kind: "empty"}
 *          | {kind: "unknown"}}
 */
export function parseVideoSource(rawUrl) {
  const url = (rawUrl || "").trim();
  if (!url) return { kind: "empty" };

  let u;
  try {
    u = new URL(url);
  } catch {
    return { kind: "unknown" };
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") return { kind: "unknown" };

  const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
  const isYouTube =
    host === "youtube.com" || host === "youtube-nocookie.com" || host === "youtu.be";

  if (!isYouTube) return { kind: "file" };

  // youtu.be/ID | /watch?v=ID | /embed/ID | /shorts/ID | /live/ID
  let id = "";
  if (host === "youtu.be") {
    id = u.pathname.slice(1).split("/")[0];
  } else if (u.pathname === "/watch") {
    id = u.searchParams.get("v") || "";
  } else {
    const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
    if (m) id = m[1];
  }

  if (!YOUTUBE_ID.test(id)) return { kind: "unknown" };

  return {
    kind: "youtube",
    id,
    start: parseStartSeconds(u.searchParams.get("t") || u.searchParams.get("start")),
  };
}

// YouTube-ийн зураг (жагсаалт/урьдчилан харахад ашиглаж болно).
export function youtubeThumbnail(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
