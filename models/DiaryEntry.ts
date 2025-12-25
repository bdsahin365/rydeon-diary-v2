import mongoose from "mongoose";

const DiaryEntrySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: [true, "Diary entry cannot be empty"],
        },
        tags: {
            type: [String],
            default: [],
        },
        moodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Mood",
        },
        isPrivate: {
            type: Boolean,
            default: true,
        },
        aiSummary: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: true }
);

// Index to quickly find user's entries by date
DiaryEntrySchema.index({ userId: 1, date: -1 });

export default mongoose.models.DiaryEntry || mongoose.model("DiaryEntry", DiaryEntrySchema);
