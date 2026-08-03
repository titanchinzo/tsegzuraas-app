import mongoose, { Schema } from "mongoose";

const ScoreSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["write", "listen"], required: true },
    score: { type: Number, required: true }, // 0-100 (accuracy) эсвэл WPM
    accuracy: { type: Number, required: true },
    wpm: { type: Number, default: 0 },
    attemptDate: { type: Date, default: Date.now },
    isMax: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ScoreSchema.index({ userId: 1, type: 1, isMax: 1 });

export default mongoose.models.Score || mongoose.model("Score", ScoreSchema);
