
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVehicleType extends Document {
    name: string;
    userId: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const VehicleTypeSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        userId: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Compound index to ensure unique names per user
VehicleTypeSchema.index({ userId: 1, name: 1 }, { unique: true });

// Check if model already exists to prevent overwrite error in dev
const VehicleType: Model<IVehicleType> =
    mongoose.models.VehicleType || mongoose.model<IVehicleType>("VehicleType", VehicleTypeSchema);

export default VehicleType;
