import { v2 as cloudinary } from "cloudinary";
import { requireRole } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    await requireRole(["teacher", "admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ error: "Файл шаардлагатай" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "tsegzuraas" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

  return Response.json({ url: result.secure_url });
}
