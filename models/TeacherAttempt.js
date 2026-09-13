import mongoose, { Schema } from "mongoose";

// Сурагч Teacher Write/Listen шалгалтыг дуусгах бүрд нэг бичлэг үүснэ.
// Тухайн type-аар хэдэн удаа өгснийг тоолж, дээд хязгаарыг (2) хэрэгжүүлнэ.
const TeacherAttemptSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["write", "listen"], required: true },
    accuracy: { type: Number, default: 0 },
    wpm: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.TeacherAttempt ||
  mongoose.model("TeacherAttempt", TeacherAttemptSchema);
