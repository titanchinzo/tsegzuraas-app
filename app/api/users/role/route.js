import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

// PUT /api/users/role - Admin хэрэглэгчийн эрх өөрчлөх
export async function PUT(req) {
  try {
    await requireRole(["admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { userId, role } = await req.json();
  if (!userId || !["admin", "teacher", "student"].includes(role)) {
    return Response.json({ error: "userId, role буруу байна" }, { status: 400 });
  }

  await connectDB();
  const updated = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!updated) {
    return Response.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
  }

  return Response.json({ user: updated });
}
