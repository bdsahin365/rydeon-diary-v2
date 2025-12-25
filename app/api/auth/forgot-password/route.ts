import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import ResetToken from "@/models/ResetToken";
import { sendPasswordResetEmail } from "@/lib/mail";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            // For security, don't reveal that the user doesn't exist
            return NextResponse.json({ message: "If an account exists, a reset email has been sent." });
        }

        const token = uuidv4();
        // Expires in 1 hour
        const expires = new Date(new Date().getTime() + 3600 * 1000);

        // Delete existing tokens for this email
        await ResetToken.deleteMany({ email });

        await ResetToken.create({
            email,
            token,
            expires,
        });

        await sendPasswordResetEmail(email, token);

        return NextResponse.json({ message: "If an account exists, a reset email has been sent." });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
