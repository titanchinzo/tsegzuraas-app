import { auth } from "@clerk/nextjs/server";
import { randomChars, CATEGORIES } from "@/lib/morse";

// GET /api/practice/write - Random 5 тэмдэгт буцаах (Дадлага, эрх: Admin/Teacher/Student)
export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
  }

  const pool = CATEGORIES.english.concat(CATEGORIES.numbers);
  const text = randomChars(5, pool);

  return Response.json({ text });
}
