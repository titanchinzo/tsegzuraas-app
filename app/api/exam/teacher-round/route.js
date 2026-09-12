import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import ExamQuestion from "@/models/ExamQuestion";
import Student from "@/models/Student";

export const dynamic = "force-dynamic";

// GET /api/exam/teacher-round?type=write|listen
// Багшийн шалгалт: Random Write/Listen Exam-тай ЯГ ХОЛБООГҮЙ, тусдаа систем.
// Тухайн сурагчийг сурагчаараа нэмсэн багш нарын ExamQuestion сангаас нэг
// бичвэрийг санамсаргүй сонгож буцаана (Admin бол бүх багшийн сангаас,
// турших зорилгоор). Текстийг ЗАЙГААР бүлэглэхгүй, түүхий хэлбэрээр
// буцаана — клиент тал (write: тэмдэгт тус бүрээр, listen: 5-аар бүлэглэж
// дараалан тоглуулах) өөрөө боловсруулна.
export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  if (!["write", "listen"].includes(type)) {
    return Response.json({ error: "type=write эсвэл listen байх ёстой" }, { status: 400 });
  }

  await connectDB();

  const match = { type };
  if (user.role === "student") {
    const links = await Student.find({ studentId: user._id }, "teacherId");
    match.teacherId = { $in: links.map((l) => l.teacherId) };
  }

  const [question] = await ExamQuestion.aggregate([
    { $match: match },
    { $sample: { size: 1 } },
  ]);

  if (!question) {
    return Response.json(
      { error: "Танай багш одоогоор шалгалтын агуулга оруулаагүй байна." },
      { status: 404 }
    );
  }

  return Response.json({ text: question.text.toUpperCase() });
}
