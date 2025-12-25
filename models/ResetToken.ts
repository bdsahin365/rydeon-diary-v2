import mongoose from "mongoose";

const ResetTokenSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expires: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

// Expire automatically after the expiry date (optional specific index, but logic will handle it too)
ResetTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.ResetToken || mongoose.model("ResetToken", ResetTokenSchema);
