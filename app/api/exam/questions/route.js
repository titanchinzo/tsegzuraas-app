import { connectDB } from "@/lib/db";
import { getCurrentUser, requireRole } from "@/lib/auth";
import ExamQuestion from "@/models/ExamQuestion";

export const dynamic = "force-dynamic";

// GET /api/exam/questions?type=write|listen - Шалгалтын 8 асуултыг random сонгож буцаана
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
  const questions = await ExamQuestion.aggregate([
    { $match: { type } },
    { $sample: { size: 8 } },
  ]);

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
