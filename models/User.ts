import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            maxlength: [60, "Name cannot be more than 60 characters"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            select: false, // Don't return password by default
        },
        image: {
            type: String,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        plan: {
            type: String,
            enum: ["free", "pro", "business"],
            default: "free",
        },
        subscriptionStatus: {
            type: String,
            default: "active",
        },
        stripeCustomerId: {
            type: String,
            unique: true,
            sparse: true,
        },
        stripeSubscriptionId: {
            type: String,
            unique: true,
            sparse: true,
        },
        stripePriceId: {
            type: String,
        },
        stripeCurrentPeriodEnd: {
            type: Date,
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
