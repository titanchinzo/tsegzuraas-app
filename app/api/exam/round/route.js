import { auth } from "@clerk/nextjs/server";
import { randomChars, CATEGORIES, textToMorse } from "@/lib/morse";

// GET /api/exam/round?type=write|listen
// Шалгалтын нэг үений random текст (10-15 тэмдэгт, дадлагаас урт) үүсгэнэ.
export async function GET(req) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  if (!["write", "listen"].includes(type)) {
    return Response.json({ error: "type=write эсвэл listen байх ёстой" }, { status: 400 });
  }

  const length = 10 + Math.floor(Math.random() * 6); // 10-15
  const pool = CATEGORIES.english.concat(CATEGORIES.numbers);
  const text = randomChars(length, pool);

  if (type === "listen") {
    return Response.json({ text, morse: textToMorse(text) });
  }
  return Response.json({ text });
}
