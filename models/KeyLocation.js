import mongoose, { Schema } from "mongoose";
import { AIMAGS } from "@/lib/aimags";

// Манай түлхүүрээр хичээллэж буй аймаг/хот. Admin чеклэхэд үүсч, чекийг
// авахад устана; нүүр хуудасны газрын зурагт тэр аймгийн төв асна.
const KeyLocationSchema = new Schema(
  {
    aimag: { type: String, required: true, unique: true, enum: AIMAGS.map((a) => a.key) },
  },
  { timestamps: true }
);

export default mongoose.models.KeyLocation || mongoose.model("KeyLocation", KeyLocationSchema);
