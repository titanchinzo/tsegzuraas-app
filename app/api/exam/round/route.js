import { auth } from "@clerk/nextjs/server";
import { randomChars, formatInGroups, CATEGORIES, textToMorse } from "@/lib/morse";

export const dynamic = "force-dynamic";

// GET /api/exam/round?type=write|listen
// Write/Listen Exam (rank/leaderboard-той, багшаас үл хамаарах) -ийн нэг
// үений random текст үүсгэнэ. Listen нь радио дуудлагын хэвшлээр (Morse
// Runner шиг) 5-аар бүлэглэгдэнэ. Багшийн өөрийн шалгалт (roster-оор
// шүүгдсэн) энэ endpoint-той огт хамааралгүй — /api/exam/teacher-round.
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

  const pool = CATEGORIES.english.concat(CATEGORIES.numbers);

  if (type === "listen") {
    const groupCount = 2 + Math.floor(Math.random() * 2); // 2-3 бүлэг
    const text = formatInGroups(randomChars(groupCount * 5, pool), 5);
    return Response.json({ text, morse: textToMorse(text) });
  }

  const length = 10 + Math.floor(Math.random() * 6); // 10-15
  const text = randomChars(length, pool);
  return Response.json({ text });
}
