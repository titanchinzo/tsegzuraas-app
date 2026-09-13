import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import TeacherAttempt from "@/models/TeacherAttempt";
import { TEACHER_EXAM_MAX_ATTEMPTS } from "@/lib/examConfig";

export const dynamic = "force-dynamic";

// POST /api/exam/teacher-submit - Teacher Write/Listen шалгалтыг дуусгасны
// дараа дуудагдаж, оролдлогыг бүртгэнэ (нийт 2 удаагийн хязгаарыг тооцоход).
// Body: { type: "write"|"listen", accuracy, wpm }
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  const { type, accuracy, wpm } = await req.json();
  if (!["write", "listen"].includes(type)) {
    return Response.json({ error: "type=write эсвэл listen байх ёстой" }, { status: 400 });
  }

  await connectDB();

  const used = await TeacherAttempt.countDocuments({ studentId: user._id, type });
  if (used >= TEACHER_EXAM_MAX_ATTEMPTS) {
    return Response.json(
      { error: `Та энэ шалгалтыг аль хэдийн ${TEACHER_EXAM_MAX_ATTEMPTS} удаа өгсөн байна.` },
      { status: 403 }
    );
  }

  await TeacherAttempt.create({
    studentId: user._id,
    type,
    accuracy: Number(accuracy) || 0,
    wpm: Number(wpm) || 0,
  });

  return Response.json({
    success: true,
    attemptsUsed: used + 1,
    maxAttempts: TEACHER_EXAM_MAX_ATTEMPTS,
  });
}
