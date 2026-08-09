import mongoose, { Schema } from "mongoose";

const LessonSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true }, // YouTube линк эсвэл Cloudinary файл
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
