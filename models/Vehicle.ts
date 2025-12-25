import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema(
    {
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DriverProfile",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        make: { type: String, required: true },
        model: { type: String, required: true },
        images: [{
            label: {
                type: String,
                enum: ['Front View', 'Rear View', 'NS View', 'OS View', 'Dashboard View', 'Front Seat', 'Rear Cabin', 'Luggage Area']
            },
            url: String
        }],
        registrationNumber: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        year: { type: Number },
        color: { type: String },
        fuelType: {
            type: String,
            enum: ['petrol', 'diesel', 'hybrid', 'electric', 'other'],
        },

        // Status
        isActive: { type: Boolean, default: true },
        complianceStatus: {
            type: String,
            enum: ['compliant', 'non_compliant', 'documents_missing', 'expired_docs'],
            default: 'documents_missing',
        },
    },
    { timestamps: true }
);

VehicleSchema.index({ driverId: 1 });
VehicleSchema.index({ registrationNumber: 1 });

export default mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);
