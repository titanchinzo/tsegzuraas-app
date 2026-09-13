import mongoose, { Schema } from "mongoose";

// Listen шалгалтын тоглуулах хурд (WPM), дууны өнгө (Hz) болон Багшийн
// шалгалтын бүлэг тус бүрд бичих зөвшөөрөгдөх хугацаа (секунд) — Багш/Admin
// тохируулдаг. key: "score-listen" (Score хуудасны random Listen) болон
// "teacher-listen" (Teacher Listen) гэсэн ХОЁР тусдаа баримт байна.
const ExamSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    wpm: { type: Number, default: 20 },
    frequency: { type: Number, default: 600 },
    secondsPerGroup: { type: Number, default: 6 },
  },
  { timestamps: true }
);

export default mongoose.models.ExamSettings ||
  mongoose.model("ExamSettings", ExamSettingsSchema);
