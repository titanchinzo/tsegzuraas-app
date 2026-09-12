import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import ExamQuestion from "@/models/ExamQuestion";

export const dynamic = "force-dynamic";

// DELETE /api/exam/questions/:id - Асуулт устгах (зөвхөн эзэмшигч Багш)
export async function DELETE(req, { params }) {
  let user;
  try {
    user = await requireRole(["teacher"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  await connectDB();
  const question = await ExamQuestion.findById(params.id);
  if (!question) {
    return Response.json({ error: "Асуулт олдсонгүй" }, { status: 404 });
  }
  if (String(question.teacherId) !== String(user._id)) {
    return Response.json({ error: "Энэ асуултыг устгах эрхгүй" }, { status: 403 });
  }

  await question.deleteOne();
  return Response.json({ success: true });
}
