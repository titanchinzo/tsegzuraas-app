import mongoose, { Schema } from "mongoose";

// Багш - Сурагчийн холбоо (spec §5 "students" collection)
const StudentSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: String, default: "" }, // Жишээ: "2026-01"
  },
  { timestamps: true }
);

StudentSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
