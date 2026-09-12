import { connectDB } from "@/lib/db";
import { requireRole, getCurrentUser } from "@/lib/auth";
import Lesson from "@/models/Lesson";
import Student from "@/models/Student";

export const dynamic = "force-dynamic";

// GET /api/lessons - Хичээл авах: Admin бүгдийг, Teacher зөвхөн өөрийнхийг,
// Student зөвхөн өөрийг сурагчаараа нэмсэн багш нарынхыг үзнэ.
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !["teacher", "student", "admin"].includes(user.role)) {
    return Response.json({ error: "Эрх байхгүй байна" }, { status: 403 });
  }

  await connectDB();

  let filter = {};
  if (user.role === "teacher") {
    filter = { teacherId: user._id };
  } else if (user.role === "student") {
    const links = await Student.find({ studentId: user._id }, "teacherId");
    filter = { teacherId: { $in: links.map((l) => l.teacherId) } };
  }

  const lessons = await Lesson.find(filter).sort({ createdAt: -1 }).populate(
    "teacherId",
    "nickname"
  );

  return Response.json({ lessons });
}

// POST /api/lessons - Багш шинэ хичээл (видео) оруулах
export async function POST(req) {
  let user;
  try {
    user = await requireRole(["teacher"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { title, videoUrl, description } = await req.json();
  if (!title || !videoUrl) {
    return Response.json({ error: "title, videoUrl шаардлагатай" }, { status: 400 });
  }

  await connectDB();
  const lesson = await Lesson.create({
    teacherId: user._id,
    title,
    videoUrl,
    description: description || "",
  });

  return Response.json({ lesson }, { status: 201 });
}
