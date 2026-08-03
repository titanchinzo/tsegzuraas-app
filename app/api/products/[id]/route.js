import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Product from "@/models/Product";

// GET /api/products/:id - Нэг бүтээгдэхүүний дэлгэрэнгүй
export async function GET(req, { params }) {
  await connectDB();
  const product = await Product.findById(params.id);
  if (!product) {
    return Response.json({ error: "Бүтээгдэхүүн олдсонгүй" }, { status: 404 });
  }
  return Response.json({ product });
}

// PUT /api/products/:id - Бүтээгдэхүүн засах (Admin)
export async function PUT(req, { params }) {
  try {
    await requireRole(["admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const updates = await req.json();
  await connectDB();
  const product = await Product.findByIdAndUpdate(params.id, updates, { new: true });
  if (!product) {
    return Response.json({ error: "Бүтээгдэхүүн олдсонгүй" }, { status: 404 });
  }
  return Response.json({ product });
}

// DELETE /api/products/:id - Бүтээгдэхүүн устгах (Admin)
export async function DELETE(req, { params }) {
  try {
    await requireRole(["admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  await connectDB();
  const product = await Product.findByIdAndDelete(params.id);
  if (!product) {
    return Response.json({ error: "Бүтээгдэхүүн олдсонгүй" }, { status: 404 });
  }
  return Response.json({ success: true });
}
