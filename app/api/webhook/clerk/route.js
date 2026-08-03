import { Webhook } from "svix";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

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

    const email = data.email_addresses?.[0]?.email_address || "";
    const ADMIN_EMAILS = ["titaniumchinzo@gmail.com"];
    const role = ADMIN_EMAILS.includes(email.trim().toLowerCase()) ? "admin" : "student";

    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        clerkId: data.id,
        nickname,
        email,
        role,
      },
      { upsert: true, new: true }
    );
  }

  if (eventType === "user.updated") {
    await User.findOneAndUpdate(
      { clerkId: data.id },
      { email: data.email_addresses?.[0]?.email_address || "" }
    );
  }

  if (eventType === "user.deleted") {
    await User.deleteOne({ clerkId: data.id });
  }

  return Response.json({ received: true });
}
