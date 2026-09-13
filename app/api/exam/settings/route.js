import { connectDB } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import ExamSettings from "@/models/ExamSettings";

const DEFAULTS = { wpm: 20, frequency: 600, secondsPerGroup: 6 };

export const dynamic = "force-dynamic";

// scope=score -> Score хуудасны Listen (random, rank-той) шалгалтад.
// scope=teacher -> Lessons дотрох Teacher Listen шалгалтад.
// Хоёр нь ЯГ тусдаа баримт тул нэгийг өөрчлөхөд нөгөө хөндөгдөхгүй.
function keyFor(scope) {
  return scope === "teacher" ? "teacher-listen" : "score-listen";
}

// GET /api/exam/settings?scope=score|teacher - тухайн Listen-ийн тоглуулах
// хурд/Hz (Teacher-ийн хувьд бүлгийн хугацаа) авах. Нэвтэрсэн хэн ч уншина.
export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const key = keyFor(searchParams.get("scope"));

  await connectDB();
  const settings = await ExamSettings.findOne({ key });

  return Response.json({
    wpm: settings?.wpm ?? DEFAULTS.wpm,
    frequency: settings?.frequency ?? DEFAULTS.frequency,
    secondsPerGroup: settings?.secondsPerGroup ?? DEFAULTS.secondsPerGroup,
  });
}

// PUT /api/exam/settings?scope=score|teacher - Багш/Admin тохируулна.
export async function PUT(req) {
  try {
    await requireRole(["teacher", "admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { searchParams } = new URL(req.url);
  const key = keyFor(searchParams.get("scope"));

  const { wpm, frequency, secondsPerGroup } = await req.json();
  const cleanWpm = Math.min(40, Math.max(5, Number(wpm) || DEFAULTS.wpm));
  const cleanFrequency = Math.min(1000, Math.max(300, Number(frequency) || DEFAULTS.frequency));
  const cleanSeconds = Math.min(30, Math.max(2, Number(secondsPerGroup) || DEFAULTS.secondsPerGroup));

  await connectDB();
  const settings = await ExamSettings.findOneAndUpdate(
    { key },
    { wpm: cleanWpm, frequency: cleanFrequency, secondsPerGroup: cleanSeconds },
    { upsert: true, new: true }
  );

  return Response.json({
    wpm: settings.wpm,
    frequency: settings.frequency,
    secondsPerGroup: settings.secondsPerGroup,
  });
}
