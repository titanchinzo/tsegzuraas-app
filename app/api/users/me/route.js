import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const ADMIN_EMAILS = ["titaniumchinzo@gmail.com"];

// GET /api/users/me - Өөрийн мэдээлэл авах (байхгүй бол автоматаар үүсгэнэ)
export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  await connectDB();
  let user = await User.findOne({ clerkId: userId });

  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "";
    const nickname =
      clerkUser?.username ||
      clerkUser?.firstName ||
      email.split("@")[0] ||
      "Хэрэглэгч";
    const role = ADMIN_EMAILS.includes(email) ? "admin" : "student";

    user = await User.create({ clerkId: userId, nickname, email, role });
  }

  return Response.json({ user });
}

// PATCH /api/users/me - Nickname шинэчлэх (анх нэвтрэх үед)
export async function PATCH(req) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  const { nickname } = await req.json();
  if (!nickname || !nickname.trim()) {
    return Response.json({ error: "Nickname шаардлагатай" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    { nickname: nickname.trim(), nicknameSet: true },
    { new: true }
  );

  return Response.json({ user });
}
