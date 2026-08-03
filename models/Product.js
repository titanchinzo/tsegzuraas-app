import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
