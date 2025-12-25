import mongoose from "mongoose";

const DriverProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        // Personal Details
        phoneNumber: { type: String },
        dateOfBirth: { type: Date },
        address: {
            line1: String,
            line2: String,
            city: String,
            postcode: String,
        },

        // Licensing Numbers (Official Identifiers)
        niNumber: { type: String }, // National Insurance
        drivingLicenceNumber: { type: String },
        tflBadgeNumber: { type: String },
        phvLicenceNumber: { type: String }, // For the driver (if applicable distinct from badge)

        // Status & Metadata
        completionStatus: {
            type: Number,
            default: 0, // 0 to 100 percentage
            min: 0,
            max: 100,
        },
        verificationStatus: {
            type: String,
            enum: ['unverified', 'pending', 'verified', 'rejected'],
            default: 'unverified',
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.models.DriverProfile || mongoose.model("DriverProfile", DriverProfileSchema);
