import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

// PUT /api/orders/:id - Admin захиалгын төлөв солих
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
  const order = await Order.findByIdAndUpdate(params.id, { status }, { new: true });
  if (!order) {
    return Response.json({ error: "Захиалга олдсонгүй" }, { status: 404 });
  }

  return Response.json({ order });
}
