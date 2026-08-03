import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  try {
    await requireRole(["admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  await connectDB();
  const users = await User.find({}, "_id nickname email role createdAt").sort({
    createdAt: -1,
  });

  return Response.json({ users });
}
