import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { AIMAG_BY_KEY } from "@/lib/aimags";
import KeyLocation from "@/models/KeyLocation";

export const dynamic = "force-dynamic";

// GET /api/key-locations - Асаалттай (түлхүүрээр хичээллэж буй) аймгууд
// (нийтэд нээлттэй)
export async function GET() {
  await connectDB();
  const aimags = await KeyLocation.distinct("aimag");
  return Response.json({ aimags });
}

// PUT /api/key-locations - Аймгийг асаах/унтраах (Admin)
export async function PUT(req) {
  try {
    await requireRole(["admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { aimag, active } = (await req.json().catch(() => null)) || {};
  // hasOwn: "constructor" гэх мэт Object.prototype-ийн нэрс аймаг болж
  // хадгалагдахаас сэргийлнэ.
  if (typeof aimag !== "string" || !Object.hasOwn(AIMAG_BY_KEY, aimag) || typeof active !== "boolean") {
    return Response.json({ error: "aimag, active буруу байна" }, { status: 400 });
  }

  await connectDB();
  if (active) {
    try {
      await KeyLocation.updateOne({ aimag }, { $setOnInsert: { aimag } }, { upsert: true });
    } catch (err) {
      // Зэрэг ирсэн хоёр upsert-ийн нэг нь unique index-д мөргөнө — аль
      // хэдийн асаалттай гэсэн үг.
      if (err.code !== 11000) throw err;
    }
  } else {
    await KeyLocation.deleteMany({ aimag });
  }

  // Нүүр хуудасны кэшлэгдсэн газрын зургийг шинэчилнэ.
  revalidateTag("key-locations");

  return Response.json({ aimags: await KeyLocation.distinct("aimag") });
}
