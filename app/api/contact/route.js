import { sendContactEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 2000;

// POST /api/contact - Footer-ийн "Захидал илгээх" форм. Нэвтрэлт шаардахгүй.
// Body: { email, message, website } — website нь ботод зориулсан нуугдмал
// талбар (хүн бөглөдөггүй).
export async function POST(req) {
  const { email, message, website } = await req.json().catch(() => ({}));

  // Бот бөглөсөн бол амжилттай мэт хариулж, юу ч илгээхгүй.
  if (website) return Response.json({ success: true });

  const cleanEmail = String(email || "").trim();
  const cleanMessage = String(message || "").trim();

  if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 200) {
    return Response.json({ error: "И-мэйл хаяг буруу байна." }, { status: 400 });
  }
  if (!cleanMessage) {
    return Response.json({ error: "Зурвас хоосон байна." }, { status: 400 });
  }
  if (cleanMessage.length > MAX_MESSAGE) {
    return Response.json(
      { error: `Зурвас ${MAX_MESSAGE} тэмдэгтээс хэтэрсэн байна.` },
      { status: 400 }
    );
  }

  const sent = await sendContactEmail({ email: cleanEmail, message: cleanMessage });
  if (!sent) {
    return Response.json(
      { error: "Зурвас илгээж чадсангүй. Дээрх и-мэйл хаягаар шууд бичнэ үү." },
      { status: 503 }
    );
  }

  return Response.json({ success: true });
}
