import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Student from "@/models/Student";

// GET /api/users/students - Багшийн сурагчдын жагсаалт
export async function GET() {
  let user;
  try {
    user = await requireRole(["teacher", "admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  await connectDB();
  const students = await Student.find({ teacherId: user._id }).populate(
    "studentId",
    "nickname email"
  );

  return Response.json({ students });
}

// POST /api/users/students - Сурагч нэмэх
export async function POST(req) {
  let user;
  try {
    user = await requireRole(["teacher", "admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { studentId, group } = await req.json();
  if (!studentId) {
    return Response.json({ error: "studentId шаардлагатай" }, { status: 400 });
  }

  await connectDB();
  const record = await Student.findOneAndUpdate(
    { teacherId: user._id, studentId },
    { group: group || "" },
    { upsert: true, new: true }
  );

  return Response.json({ student: record });
}

// DELETE /api/users/students?studentId=... - Сурагч хасах
export async function DELETE(req) {
  let user;
  try {
    user = await requireRole(["teacher", "admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) {
    return Response.json({ error: "studentId шаардлагатай" }, { status: 400 });
  }

  await connectDB();
  await Student.deleteOne({ teacherId: user._id, studentId });

  return Response.json({ success: true });
}
