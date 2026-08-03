import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Score from "@/models/Score";
import User from "@/models/User"; // eslint-disable-line no-unused-vars -- populate-д хэрэгтэй

export const dynamic = "force-dynamic";

// GET /api/scores/leaderboard - Top 10 (нийт, write, listen тус тусад) + одоогийн хэрэглэгчийн байр
export async function GET() {
  await connectDB();
  const currentUser = await getCurrentUser();

  // isMax score-уудыг user тус бүрээр цуглуулна
  const maxScores = await Score.find({ isMax: true }).populate("userId", "nickname");

  const totals = new Map(); // userId -> { nickname, write, listen, total }
  for (const s of maxScores) {
    if (!s.userId) continue;
    const key = String(s.userId._id);
    if (!totals.has(key)) {
      totals.set(key, { userId: key, nickname: s.userId.nickname, write: 0, listen: 0 });
    }
    totals.get(key)[s.type] = s.score;
  }

  const combined = Array.from(totals.values()).map((u) => ({
    ...u,
    total: (u.write || 0) + (u.listen || 0),
  }));

  const byTotal = [...combined].sort((a, b) => b.total - a.total);
  const byWrite = [...combined].sort((a, b) => b.write - a.write);
  const byListen = [...combined].sort((a, b) => b.listen - a.listen);

  function withMyRank(list) {
    const top10 = list.slice(0, 10);
    if (!currentUser) return { top10, me: null };

    const myIndex = list.findIndex((u) => u.userId === String(currentUser._id));
    if (myIndex === -1 || myIndex < 10) {
      return { top10, me: null }; // Топ 10-д багтсан эсвэл огт оноогүй
    }
    return { top10, me: { ...list[myIndex], rank: myIndex + 1 } };
  }

  return Response.json({
    total: withMyRank(byTotal),
    write: withMyRank(byWrite),
    listen: withMyRank(byListen),
  });
}
