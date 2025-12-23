import mongoose from "mongoose";

const OperatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    chargesCommission: { type: Boolean, default: false },
    commissionRate: { type: Number },
    paymentCycle: { type: String },
    userId: { type: String, required: true, index: true },
}, { timestamps: true });

export default mongoose.models.Operator || mongoose.model("Operator", OperatorSchema);
