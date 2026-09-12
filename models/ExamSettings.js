import mongoose, { Schema } from "mongoose";

// Listen шалгалтын тоглуулах хурд (WPM), дууны өнгө (Hz) болон Багшийн
// шалгалтын бүлэг тус бүрд бичих зөвшөөрөгдөх хугацаа (секунд) — Багш/Admin
// тохируулдаг singleton баримт (key үргэлж "listen").
const ExamSettingsSchema = new Schema(
  {
    key: { type: String, default: "listen", unique: true },
    wpm: { type: Number, default: 20 },
    frequency: { type: Number, default: 600 },
    secondsPerGroup: { type: Number, default: 6 },
  },
  { timestamps: true }
);

export default mongoose.models.ExamSettings ||
  mongoose.model("ExamSettings", ExamSettingsSchema);
