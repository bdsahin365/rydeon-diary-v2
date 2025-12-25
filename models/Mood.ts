import mongoose from "mongoose";

const MoodSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
        },
        tags: {
            type: [String], // e.g., "Happy", "Stressed", "Productive"
            default: [],
        },
        note: {
            type: String,
            maxlength: 500,
        },
        date: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: true }
);

MoodSchema.index({ userId: 1, date: -1 });

export default mongoose.models.Mood || mongoose.model("Mood", MoodSchema);
