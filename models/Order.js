import mongoose, { Schema } from "mongoose";

// Бүтээгдэхүүний захиалга — Product хуудаснаас нэвтрэлт шаардахгүйгээр
// хэн ч өгч болно. Admin самбарт жагсаагдаж, нэмэлтээр имэйлээр мэдэгдэнэ.
const OrderSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "confirmed", "done", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
