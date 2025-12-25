import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        driverProfileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DriverProfile",
        },
        vehicleId: { // Optional, link doc to a specific vehicle
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
        },
        type: {
            type: String,
            required: true,
            enum: [
                // Driver Documents
                'profile_photo',
                'driving_licence_front',
                'driving_licence_back',
                'tfl_badge', // The card
                'tfl_paper_licence', // The paper counterpart
                'payout_details',

                // Vehicle Documents
                'v5c_logbook',
                'mot_certificate',
                'insurance_certificate',
                'rental_agreement',

                'other'
            ]
        },
        fileUrl: {
            type: String,
            required: true,
        },
        fileName: {
            type: String,
        },
        issueDate: {
            type: Date,
        },
        expiryDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['uploaded', 'pending_review', 'verified', 'rejected', 'expired'],
            default: 'uploaded',
        },
        rejectionReason: {
            type: String,
        },
        metadata: {
            type: Map,
            of: String, // Store extra extracted info like "licence_number" verified by OCR if added later
        }
    },
    { timestamps: true }
);

// Index for quick lookup of user's specific document types
DocumentSchema.index({ userId: 1, type: 1 });

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);
