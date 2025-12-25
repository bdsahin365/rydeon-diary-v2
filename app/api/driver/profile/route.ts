import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import DriverProfile from "@/models/DriverProfile";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Try to find existing profile
        const profile = await DriverProfile.findOne({ userId: session.user.id }).populate('userId', 'email');

        if (!profile) {
            // If no profile, try to fetch user info to return email at least
            const user = await User.findById(session.user.id).select('email');
            return NextResponse.json({ exists: false, email: user?.email });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Fetch profile error:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        await dbConnect();

        // Upsert profile
        const profile = await DriverProfile.findOneAndUpdate(
            { userId: session.user.id },
            {
                $set: {
                    ...data,
                    userId: session.user.id // Ensure userId is never changed
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
