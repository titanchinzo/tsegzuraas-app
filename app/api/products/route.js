import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Product from "@/models/Product";

// GET /api/products - Бүх бүтээгдэхүүн авах (Guest ч үзнэ)
export async function GET() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 });
  return Response.json({ products });
}

// POST /api/products - Admin шинэ бүтээгдэхүүн нэмэх
export async function POST(req) {
  try {
    await requireRole(["admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { name, price, description, imageUrl, stock } = await req.json();
  if (!name || price === undefined) {
    return Response.json({ error: "name, price шаардлагатай" }, { status: 400 });
  }

  await connectDB();
  const product = await Product.create({
    name,
    price,
    description: description || "",
    imageUrl: imageUrl || "",
    stock: stock || 0,
  });

  return Response.json({ product }, { status: 201 });
}
