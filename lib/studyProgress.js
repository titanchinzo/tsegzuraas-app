// Study хичээлийн явцыг браузерт хадгална.
//
// Сервер талд хичээл тус бүрийн загвар байхгүй бөгөөд энэ нь дадлагын явц
// (шалгалтын оноо биш) тул localStorage хангалттай. Шалгалтын оноо хэвээрээ
// Score коллекцид үлдэнэ.

const KEY = "tsegzuraas.study.v1";

export function loadProgress() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    // Хуучин/эвдэрсэн өгөгдөл байвал явцыг тэглэхээс илүү хоосон эхлүүлнэ.
    return {};
  }
}

// Урьд нь илүү сайн үзүүлэлт гаргасан бол дарж бичихгүй.
export function saveLessonResult(lessonId, { stars, accuracy }) {
  if (typeof window === "undefined") return loadProgress();

  const progress = loadProgress();
  const prev = progress[lessonId];

  if (!prev || stars > prev.stars || (stars === prev.stars && accuracy > prev.accuracy)) {
    progress[lessonId] = { stars, accuracy, at: Date.now() };
  }

  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* хадгалах боломжгүй (private горим г.м.) — явц алдагдана, гэхдээ
       хичээл өөрөө ажиллах ёстой тул алдааг залгина. */
  }
  return progress;
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* тоохгүй */
  }
}

export function summarize(progress, lessons) {
  const done = lessons.filter((l) => progress[l.id]?.stars > 0).length;
  const stars = lessons.reduce((sum, l) => sum + (progress[l.id]?.stars || 0), 0);
  return {
    done,
    total: lessons.length,
    percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0,
    stars,
    maxStars: lessons.length * 3,
  };
}
