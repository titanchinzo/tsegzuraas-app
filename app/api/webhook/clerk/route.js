import { Webhook } from "svix";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth";
import User from "@/models/User";

// /api/users/me-ийн pickBestEmail-тэй ижил дараалал: ADMIN_EMAILS-тэй таарсан,
// дараа нь тэргүүлэх, эцэст нь эхний имэйл. Зөвхөн [0]-ийг авбал хэрэглэгч
// имэйлээ шинэчлэхэд тэргүүлэх биш имэйл хадгалагдаж болно.
function pickEmail(data) {
  const emails = data.email_addresses || [];
  const adminMatch = emails.find((e) => isAdminEmail(e.email_address));
  const primary = emails.find((e) => e.id === data.primary_email_address_id);
  return adminMatch?.email_address || primary?.email_address || emails[0]?.email_address || "";
}

// Clerk-ээс хэрэглэгч үүсэх/шинэчлэгдэх үед дуудагдана.
// Clerk Dashboard > Webhooks дээр энэ endpoint-ийг бүртгэж, CLERK_WEBHOOK_SECRET-ийг .env-д тохируулна.
export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return Response.json(
      { error: "CLERK_WEBHOOK_SECRET тохируулаагүй байна" },
      { status: 500 }
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json({ error: "Svix header дутуу байна" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    return Response.json({ error: "Webhook баталгаажуулалт амжилтгүй" }, { status: 400 });
  }

  await connectDB();

  const eventType = evt.type;
  const data = evt.data;

  if (eventType === "user.created") {
    // Анхны бүртгэлээр анхдагч nickname-ийг Clerk username/first name-ээс авна.
    // Клиент талд /api/users/me PATCH-аар дараа нь Nickname-ээ сольж болно.
    const nickname =
      data.username ||
      data.first_name ||
      (data.email_addresses?.[0]?.email_address?.split("@")[0]) ||
      "Хэрэглэгч";
    const email = pickEmail(data);
    const role = isAdminEmail(email) ? "admin" : "student";

    // nickname/role-г зөвхөн шинээр үүсгэхэд л онооно. Хэрэглэгч /api/users/me-ээр
    // аль хэдийн үүсч, хоч нэрээ сонгосны дараа (эсвэл Admin эрхийг нь өөрчилсний
    // дараа) webhook хоцорч ирэх, Svix дахин илгээх үед тэдгээрийг дарж
    // бичдэг байв.
    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        $set: { email },
        $setOnInsert: { clerkId: data.id, nickname, role },
      },
      { upsert: true, new: true }
    );
  }

  if (eventType === "user.updated") {
    await User.findOneAndUpdate({ clerkId: data.id }, { email: pickEmail(data) });
  }

  if (eventType === "user.deleted") {
    await User.deleteOne({ clerkId: data.id });
  }

  return Response.json({ received: true });
}
