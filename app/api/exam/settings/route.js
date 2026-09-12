import { connectDB } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import ExamSettings from "@/models/ExamSettings";

const DEFAULTS = { wpm: 20, frequency: 600 };

export const dynamic = "force-dynamic";

// GET /api/exam/settings - Listen шалгалтын тоглуулах хурд/Hz авах.
// Нэвтэрсэн хэн ч (тоглуулахад ашиглана тул) уншиж болно.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  await connectDB();
  const settings = await ExamSettings.findOne({ key: "listen" });

  return Response.json({
    wpm: settings?.wpm ?? DEFAULTS.wpm,
    frequency: settings?.frequency ?? DEFAULTS.frequency,
  });
}

// PUT /api/exam/settings - Багш/Admin Listen шалгалтын хурд, Hz-ийг тохируулна.
export async function PUT(req) {
  try {
    await requireRole(["teacher", "admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { wpm, frequency } = await req.json();
  const cleanWpm = Math.min(40, Math.max(5, Number(wpm) || DEFAULTS.wpm));
  const cleanFrequency = Math.min(1000, Math.max(300, Number(frequency) || DEFAULTS.frequency));

  await connectDB();
  const settings = await ExamSettings.findOneAndUpdate(
    { key: "listen" },
    { wpm: cleanWpm, frequency: cleanFrequency },
    { upsert: true, new: true }
  );

  return Response.json({ wpm: settings.wpm, frequency: settings.frequency });
}
