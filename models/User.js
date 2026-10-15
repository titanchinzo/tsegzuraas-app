import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    nickname: { type: String, required: true, trim: true },
    email: { type: String },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },
    nicknameSet: { type: Boolean, default: false },
    // Түлхүүрийн шинэ загвар гарахад утсаар мэдэгдэхэд (заавал биш).
    phone: { type: String, trim: true, default: "" },
    // Манай зардаг FSA01 түлхүүртэй эсэх; null — хариулаагүй.
    hasFsa01: { type: Boolean, default: null },
    // Утас/FSA01 асуух цонхонд хариулсан (хадгалсан/алгассан) эсэх —
    // автоматаар зөвхөн нэг удаа асууна.
    keyInfoAsked: { type: Boolean, default: false },
    // Admin ban хийсэн. Clerk дээр мөн ban-тай тул нэвтэрч чадахгүй.
    banned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
