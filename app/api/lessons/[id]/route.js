import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Lesson from "@/models/Lesson";

// DELETE /api/lessons/:id - Хичээл устгах (эзэмшигч Багш эсвэл Admin)
export async function DELETE(req, { params }) {
  let user;
  try {
    user = await requireRole(["teacher", "admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  await connectDB();
  const lesson = await Lesson.findById(params.id);
  if (!lesson) {
    return Response.json({ error: "Хичээл олдсонгүй" }, { status: 404 });
  }
  if (user.role !== "admin" && String(lesson.teacherId) !== String(user._id)) {
    return Response.json({ error: "Энэ хичээлийг устгах эрхгүй" }, { status: 403 });
  }

  await lesson.deleteOne();
  return Response.json({ success: true });
}
