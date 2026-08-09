import { v2 as cloudinary } from "cloudinary";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/upload/signature
// Браузер Cloudinary руу ШУУД upload хийхэд шаардлагатай гарын үсгийг олгоно.
//
// Яагаад шууд upload вэ: файлыг өөрсдийн сервэрээр дамжуулбал Vercel-ийн
// serverless функцын 4.5MB-ийн биеийн хязгаарт мөргөх бөгөөд видео хичээл
// бараг үргэлж үүнээс том байдаг. Мөн серверээр дамжуулбал браузер upload-ын
// бодит явцыг мэдэх боломжгүй болно. Шууд upload хийснээр хоёулаа шийдэгдэнэ.
//
// api_secret нь энд серверт үлдэж, зөвхөн гарын үсэг гадагш гардаг тул
// unsigned preset-ээс аюулгүй (эрхгүй хүн upload хийж чадахгүй).
export async function POST() {
  try {
    await requireRole(["teacher", "admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || cloudName === "your-cloud-name") {
    return Response.json(
      { error: "Cloudinary тохируулаагүй байна. Админд хандана уу." },
      { status: 503 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "tsegzuraas";

  // Гарын үсэгт орсон параметрүүд upload хүсэлт дээр ЯГ адилхан очих ёстой,
  // эс бөгөөс Cloudinary 401 буцаана.
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    apiSecret
  );

  return Response.json({
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    apiKey,
    timestamp,
    folder,
    signature,
  });
}
