import mongoose from "mongoose";

const SharedLinkSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        driverProfileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DriverProfile",
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        sections: {
            type: [String],
            required: true,
            enum: ['profile_overview', 'documents', 'vehicle'],
        },
        // Options
        expiresAt: {
            type: Date,
            required: true,
        },
        isPasswordProtected: { type: Boolean, default: false },
        passwordHash: { type: String }, // Optional

        // Access tracking
        viewCount: { type: Number, default: 0 },
        lastViewedAt: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

SharedLinkSchema.index({ token: 1 });

export default mongoose.models.SharedLink || mongoose.model("SharedLink", SharedLinkSchema);
