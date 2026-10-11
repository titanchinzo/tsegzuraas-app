import { auth } from "@clerk/nextjs/server";
import { randomChars, charPool, cleanAlphabet, textToMorse } from "@/lib/morse";

export const dynamic = "force-dynamic";

// GET /api/practice/listen?alphabet=english|mongol - Random 5 тэмдэгтийн
// морзын дараалал буцаах. Аудиог клиент талд Web Audio API-аар шууд
// тоглуулна (URL биш, морз кодыг буцаана).
export async function GET(req) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const alphabet = cleanAlphabet(searchParams.get("alphabet"));
  const text = randomChars(5, charPool(alphabet));

  return Response.json({ text, morse: textToMorse(text) });
}
