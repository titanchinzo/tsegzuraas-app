// Write/Listen дадлага болон шалгалтын онооны логик (Spec §7)

/**
 * Хэрэглэгчийн бичсэн текстийг зорилтот текст (generated) -тэй харьцуулж,
 * зөв/буруу тэмдэгтийн тоог гаргана.
 */
export function diffAccuracy(target, input) {
  const t = (target || "").toUpperCase();
  const i = (input || "").toUpperCase();
  const len = Math.max(t.length, i.length);
  let correct = 0;
  let errors = 0;

  for (let idx = 0; idx < len; idx++) {
    if (t[idx] && t[idx] === i[idx]) {
      correct++;
    } else {
      errors++;
    }
  }

  const total = t.length || 1;
  const accuracy = Math.max(0, Math.round((correct / total) * 100));

  return { correct, errors, total, accuracy };
}

/**
 * WPM = (нийт тэмдэгт / 5) / (хугацаа минутаар)
 * durationSeconds: хэрэглэгчийн бичихэд зарцуулсан секунд
 */
export function calcWPM(totalChars, durationSeconds) {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  const words = totalChars / 5;
  const minutes = durationSeconds / 60;
  return Math.round((words / minutes) * 10) / 10;
}

/**
 * Нэг дадлага/шалгалтын үр дүнг нэгтгэн score object болгоно.
 */
export function buildAttemptResult({ target, input, durationSeconds }) {
  const { correct, errors, total, accuracy } = diffAccuracy(target, input);
  const wpm = calcWPM(total, durationSeconds);

  return {
    correct,
    errors,
    total,
    accuracy, // 0-100, эцсийн оноо (score) энэ дээр суурилна
    wpm,
    durationSeconds,
  };
}

/**
 * Write/Listen Exam: 5 үений дүнг нэгтгэж дундаж/нийлбэр оноо гаргана.
 */
export function aggregateExamAttempts(attempts) {
  if (!attempts || attempts.length === 0) {
    return { score: 0, accuracy: 0, wpm: 0 };
  }
  const avgAccuracy =
    attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length;
  const avgWpm = attempts.reduce((sum, a) => sum + a.wpm, 0) / attempts.length;

  return {
    score: Math.round(avgAccuracy),
    accuracy: Math.round(avgAccuracy),
    wpm: Math.round(avgWpm * 10) / 10,
  };
}
