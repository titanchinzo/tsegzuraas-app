import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import ExamQuestion from "@/models/ExamQuestion";

export const dynamic = "force-dynamic";

// GET /api/exam/questions - Багшийн өөрийн нэмсэн шалгалтын агуулгын сан
// (Teacher dashboard-д жагсаалт+устгах харуулахад ашиглана; шалгалт өгөх
// үед нэг үений текстийг эндээс биш /api/exam/round-оос сурагчийн багш
// нараар шүүж авдаг).
export async function GET() {
  let user;
  try {
    user = await requireRole(["teacher"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  await connectDB();
  const questions = await ExamQuestion.find({ teacherId: user._id }).sort({ createdAt: -1 });

  return Response.json({ questions });
}

// POST /api/exam/questions - Багш шалгалтын асуулт оруулах
export async function POST(req) {
  let user;
  try {
    user = await requireRole(["teacher"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { type, text } = await req.json();
  if (!["write", "listen"].includes(type) || !text) {
    return Response.json({ error: "type, text шаардлагатай" }, { status: 400 });
  }

  await connectDB();
  const question = await ExamQuestion.create({ teacherId: user._id, type, text });
  return Response.json({ question }, { status: 201 });
}
