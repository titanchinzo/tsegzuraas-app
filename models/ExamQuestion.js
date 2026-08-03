import mongoose, { Schema } from "mongoose";

const ExamQuestionSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["write", "listen"], required: true },
    text: { type: String, required: true }, // Бичих асуулт / Аудио үүсгэх текст
  },
  { timestamps: true }
);

export default mongoose.models.ExamQuestion ||
  mongoose.model("ExamQuestion", ExamQuestionSchema);
