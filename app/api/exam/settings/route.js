import { connectDB } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import ExamSettings from "@/models/ExamSettings";

const DEFAULTS = { wpm: 20, frequency: 600, secondsPerGroup: 6 };

export const dynamic = "force-dynamic";

// GET /api/exam/settings - Listen шалгалтын тоглуулах хурд/Hz, Багшийн
// шалгалтын бүлэг тус бүрийн хугацааг авах. Нэвтэрсэн хэн ч уншиж болно.
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
    secondsPerGroup: settings?.secondsPerGroup ?? DEFAULTS.secondsPerGroup,
  });
}

// PUT /api/exam/settings - Багш/Admin хурд, Hz, бүлгийн хугацааг тохируулна.
export async function PUT(req) {
  try {
    await requireRole(["teacher", "admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { wpm, frequency, secondsPerGroup } = await req.json();
  const cleanWpm = Math.min(40, Math.max(5, Number(wpm) || DEFAULTS.wpm));
  const cleanFrequency = Math.min(1000, Math.max(300, Number(frequency) || DEFAULTS.frequency));
  const cleanSeconds = Math.min(30, Math.max(2, Number(secondsPerGroup) || DEFAULTS.secondsPerGroup));

  await connectDB();
  const settings = await ExamSettings.findOneAndUpdate(
    { key: "listen" },
    { wpm: cleanWpm, frequency: cleanFrequency, secondsPerGroup: cleanSeconds },
    { upsert: true, new: true }
  );

  return Response.json({
    wpm: settings.wpm,
    frequency: settings.frequency,
    secondsPerGroup: settings.secondsPerGroup,
  });
}
