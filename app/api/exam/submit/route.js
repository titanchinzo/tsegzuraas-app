import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Score from "@/models/Score";
import { aggregateExamAttempts } from "@/lib/scoring";

// POST /api/exam/submit
// Body: { type: "write"|"listen", attempts: [{ accuracy, wpm, correct, errors, total, durationSeconds }, ...] (8ш) }
// Зөвхөн Student эрхтэй хэрэглэгч шалгалт өгнө (spec: Write/Listen Шалгалт - Student only).
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }
  if (user.role !== "student") {
    return Response.json(
      { error: "Зөвхөн Student шалгалт өгөх боломжтой" },
      { status: 403 }
    );
  }

  const { type, attempts } = await req.json();
  if (!["write", "listen"].includes(type) || !Array.isArray(attempts) || attempts.length === 0) {
    return Response.json({ error: "type, attempts (8 удаагийн) шаардлагатай" }, { status: 400 });
  }

  const { score, accuracy, wpm } = aggregateExamAttempts(attempts);

  await connectDB();

  // Хэрэглэгчийн өмнөх MAX оноотой харьцуулна
  const prevMax = await Score.findOne({ userId: user._id, type, isMax: true }).sort({
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
