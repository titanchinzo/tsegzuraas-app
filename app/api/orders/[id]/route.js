import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

// PUT /api/orders/:id - Admin захиалгын төлөв солих.
// Захиалга анх удаа "confirmed" болоход холбогдох Product-ийн үлдэгдлээс
// (stock) захиалсан тоо хэмжээгээр автоматаар хасна (0-ээс доош орохгүй).
// Дараа нь дахин confirmed болгосон ч (жиш: done->confirmed) давхар
// хасахгүй — зөвхөн "confirmed биш байснаас confirmed болох" шилжилтэд.
export async function PUT(req, { params }) {
  try {
    await requireRole(["admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { status } = await req.json();
  if (!["new", "confirmed", "done", "cancelled"].includes(status)) {
    return Response.json({ error: "status буруу байна" }, { status: 400 });
  }

  await connectDB();

  const existing = await Order.findById(params.id);
  if (!existing) {
    return Response.json({ error: "Захиалга олдсонгүй" }, { status: 404 });
  }

  const shouldDeductStock = status === "confirmed" && existing.status !== "confirmed";

  if (shouldDeductStock) {
    const product = await Product.findById(existing.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - existing.quantity);
      await product.save();
    }
  }

  existing.status = status;
  await existing.save();

  return Response.json({ order: existing });
}
