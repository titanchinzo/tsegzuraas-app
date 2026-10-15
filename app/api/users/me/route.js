import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Clerk хэрэглэгчийн ХАМГИЙН ТОХИРОХ имэйлийг олно: эхлээд ADMIN_EMAILS-тэй
// таарч буй аль ч имэйл байвал үүнийг сонгоно (тэргүүлэх/анхны имэйл гэдэг
// нь ADMIN_EMAILS-ийн жагсаалтад байгаа эсэхийг үл харгалзана — зөвхөн
// emailAddresses[0]-ийг шалгах нь тэргүүлэх имэйл өөр индекст байх үед
// admin эрх олгохгүй байх алдаа үүсгэдэг байсан тул бүх имэйлийг шалгана).
function pickBestEmail(clerkUser) {
  const emails = clerkUser?.emailAddresses || [];
  const adminMatch = emails.find((e) => isAdminEmail(e.emailAddress));
  if (adminMatch) return adminMatch.emailAddress;

  const primary = emails.find((e) => e.id === clerkUser?.primaryEmailAddressId);
  return primary?.emailAddress || emails[0]?.emailAddress || "";
}

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
    const email = pickBestEmail(clerkUser);
    const nickname =
      clerkUser?.username ||
      clerkUser?.firstName ||
      email.split("@")[0] ||
      "Хэрэглэгч";
    const role = isAdminEmail(email) ? "admin" : "student";

    user = await User.create({ clerkId: userId, nickname, email, role });
  } else {
    // DB-д хадгалагдсан email нь анх буруу/хоосон бичигдсэн байвал (жишээ:
    // webhook тохируулагдаагүй үед race condition, эсвэл тэргүүлэх бус
    // индексийн имэйл авагдсан) ADMIN_EMAILS шалгалт тасралтгүй
    // бүтэлгүйтдэг тул Clerk-ээс одоогийн бүх имэйлийг шинээр шалгаж,
    // хадгалагдсан утгыг синк хийж, admin эрхийг дахин тооцно.
    const clerkUser = await currentUser();
    const liveEmail = pickBestEmail(clerkUser);
    let dirty = false;

    if (liveEmail && liveEmail !== user.email) {
      user.email = liveEmail;
      dirty = true;
    }
    if (isAdminEmail(liveEmail || user.email) && user.role !== "admin") {
      user.role = "admin";
      dirty = true;
    }
    if (dirty) await user.save();
  }

  return Response.json({ user });
}

// "+976 9911-2233" → "99112233". Гадаад дугаарыг "+"-тэй нь хадгална.
function normalizePhone(raw) {
  const compact = String(raw).replace(/[\s\-()]/g, "");
  const local = compact.match(/^(?:\+?976)?(\d{8})$/);
  if (local) return local[1];
  if (/^\+\d{8,15}$/.test(compact)) return compact;
  return null;
}

// PATCH /api/users/me - Nickname (анх нэвтрэх үед) эсвэл утасны дугаар
// шинэчлэх. phone: "" нь алгассан/устгасныг илэрхийлнэ — аль ч тохиолдолд
// дахин автоматаар асуухгүй.
export async function PATCH(req) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  const body = await req.json();
  const update = {};

  if ("phone" in body) {
    const phone = body.phone ? normalizePhone(body.phone) : "";
    if (phone === null) {
      return Response.json(
        { error: "Утасны дугаар буруу байна (жишээ нь: 99112233)" },
        { status: 400 }
      );
    }
    update.phone = phone;
    update.phoneAsked = true;
  } else {
    const { nickname } = body;
    if (!nickname || !nickname.trim()) {
      return Response.json({ error: "Nickname шаардлагатай" }, { status: 400 });
    }
    update.nickname = nickname.trim();
    update.nicknameSet = true;
  }

  await connectDB();
  const user = await User.findOneAndUpdate({ clerkId: userId }, update, { new: true });

  return Response.json({ user });
}
