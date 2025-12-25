import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import ResetToken from "@/models/ResetToken";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        await dbConnect();

        const existingToken = await ResetToken.findOne({ token });

        if (!existingToken) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const hasExpired = new Date() > new Date(existingToken.expires);

        if (hasExpired) {
            await ResetToken.deleteOne({ _id: existingToken._id });
            return NextResponse.json({ error: "Token has expired" }, { status: 400 });
        }

        const user = await User.findOne({ email: existingToken.email });

        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
        });

        await ResetToken.deleteOne({ _id: existingToken._id });

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
