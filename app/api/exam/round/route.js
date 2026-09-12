import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatInGroups, textToMorse } from "@/lib/morse";
import ExamQuestion from "@/models/ExamQuestion";
import Student from "@/models/Student";

export const dynamic = "force-dynamic";

// GET /api/exam/round?type=write|listen
// Нэг үений шалгалтын текстийг Багшийн ExamQuestion сангаас санамсаргүй
// сонгоно. Student бол зөвхөн өөрийг сурагчаараа нэмсэн багш нарын
// агуулгаас сонгогдоно (Admin бол бүх багшийн сангаас, турших зорилгоор).
// Listen текстийг радио дуудлагын хэвшлээр (Morse Runner шиг) 5-аар
// бүлэглэж буцаана.
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

  const text = question.text.toUpperCase();

  if (type === "listen") {
    const grouped = formatInGroups(text, 5);
    return Response.json({ text: grouped, morse: textToMorse(grouped) });
  }

  return Response.json({ text });
}
