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
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
