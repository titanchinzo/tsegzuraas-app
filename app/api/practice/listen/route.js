import { auth } from "@clerk/nextjs/server";
import { randomChars, CATEGORIES, textToMorse } from "@/lib/morse";

export const dynamic = "force-dynamic";

// GET /api/practice/listen - Random 5 тэмдэгтийн морзын дараалал буцаах.
// Аудиог клиент талд Web Audio API-аар шууд тоглуулна (URL биш, морз кодыг буцаана).
export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  const pool = CATEGORIES.english.concat(CATEGORIES.numbers);
  const text = randomChars(5, pool);

  return Response.json({ text, morse: textToMorse(text) });
}
