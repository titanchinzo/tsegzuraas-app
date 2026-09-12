import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

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
  const users = await User.find(filter, "_id nickname email role createdAt").sort({
    createdAt: -1,
  });

  return Response.json({ users });
}
