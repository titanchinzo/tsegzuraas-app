import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Score, { alphabetFilter } from "@/models/Score";
import { aggregateExamAttempts } from "@/lib/scoring";
import { cleanAlphabet } from "@/lib/morse";

// POST /api/exam/submit
// Body: { type: "write"|"listen", alphabet: "english"|"mongol", attempts: [{ accuracy, wpm, correct, errors, total, durationSeconds }, ...] (5ш) }
// Student эрхтэй хэрэглэгч шалгалт өгнө; Admin бас турших зорилгоор өгч болно
// (spec: Write/Listen Шалгалт - Student only, Admin-д тест хийх эрх нэмэгдсэн).
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }
  if (!["student", "admin"].includes(user.role)) {
    return Response.json(
      { error: "Зөвхөн Student шалгалт өгөх боломжтой" },
      { status: 403 }
    );
  }

  const { type, attempts, alphabet: rawAlphabet } = await req.json();
  const alphabet = cleanAlphabet(rawAlphabet);
  if (!["write", "listen"].includes(type) || !Array.isArray(attempts) || attempts.length === 0) {
    return Response.json({ error: "type, attempts (5 удаагийн) шаардлагатай" }, { status: 400 });
  }

  const { score, accuracy, wpm } = aggregateExamAttempts(attempts);

  await connectDB();

  // Хэрэглэгчийн тухайн горимын өмнөх MAX оноотой харьцуулна
  const prevMax = await Score.findOne({
    userId: user._id,
    type,
    isMax: true,
    ...alphabetFilter(alphabet),
  }).sort({
    score: -1,
  });

  let isNewMax = false;
  if (!prevMax || score > prevMax.score) {
    isNewMax = true;
    if (prevMax) {
      prevMax.isMax = false;
      await prevMax.save();
    }
  }

  const newScore = await Score.create({
    userId: user._id,
    type,
    alphabet,
    score,
    accuracy,
    wpm,
    attemptDate: new Date(),
    isMax: isNewMax,
  });

  return Response.json({
    result: { score, accuracy, wpm, isNewMax },
    scoreId: newScore._id,
  });
}
