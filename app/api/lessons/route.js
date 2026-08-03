import { connectDB } from "@/lib/db";
import { requireRole, getCurrentUser } from "@/lib/auth";
import Lesson from "@/models/Lesson";

// GET /api/lessons - Бүх хичээл авах (Teacher, Student эрхтэй үзнэ)
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !["teacher", "student"].includes(user.role)) {
    return Response.json({ error: "Эрх байхгүй байна" }, { status: 403 });
  }

  await connectDB();
  const lessons = await Lesson.find().sort({ createdAt: -1 }).populate(
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
