import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { sendOrderEmail } from "@/lib/email";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

// GET /api/orders - Admin бүх захиалгыг харна.
export async function GET() {
  try {
    await requireRole(["admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 });

  return Response.json({ orders });
}

// POST /api/orders - Захиалга өгөх. Нэвтрэлт шаардахгүй (Product хуудас
// нийтэд нээлттэй тул захиалга ч мөн адил). Бодит үнийг Product-оос авна —
// клиентээс ирсэн үнэнд итгэхгүй.
export async function POST(req) {
  const { productId, quantity, customerName, customerPhone, note } = await req.json();

  if (!productId || !customerName?.trim() || !customerPhone?.trim()) {
    return Response.json(
      { error: "productId, нэр, утасны дугаар шаардлагатай" },
      { status: 400 }
    );
  }

  const cleanQuantity = Math.max(1, Math.round(Number(quantity) || 1));

  await connectDB();
  const product = await Product.findById(productId);
  if (!product) {
    return Response.json({ error: "Бүтээгдэхүүн олдсонгүй" }, { status: 404 });
  }

  const order = await Order.create({
    productId: product._id,
    productName: product.name,
    price: product.price,
    quantity: cleanQuantity,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    note: (note || "").trim(),
  });

  await sendOrderEmail({
    productName: product.name,
    price: product.price,
    quantity: cleanQuantity,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    note: order.note,
  });

  return Response.json({ order }, { status: 201 });
}
