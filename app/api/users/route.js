import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET /api/users - Admin бүх хэрэглэгчийг, Teacher зөвхөн сурагчдын
// жагсаалтыг (сурагч нэмэх сонголтод зориулан) харна.
export async function GET() {
  let user;
  try {
    user = await requireRole(["admin", "teacher"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  await connectDB();
  const filter = user.role === "teacher" ? { role: "student" } : {};
  // Утас, ban-ы төлөвийг зөвхөн Admin харна.
  const fields =
    user.role === "admin"
      ? "_id nickname email phone banned role createdAt"
      : "_id nickname email role createdAt";
  const users = await User.find(filter, fields).sort({
    createdAt: -1,
  });

  return Response.json({ users });
}
