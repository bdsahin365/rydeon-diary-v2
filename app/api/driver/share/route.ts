import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import SharedLink from "@/models/SharedLink";
import DriverProfile from "@/models/DriverProfile";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sections, expiresInDays } = await req.json();

        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            return NextResponse.json({ error: "Select at least one section to share" }, { status: 400 });
        }

        await dbConnect();
        const profile = await DriverProfile.findOne({ userId: session.user.id });
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7)); // Default 7 days

        const link = await SharedLink.create({
            userId: session.user.id,
            driverProfileId: profile._id,
            token,
            sections,
            expiresAt,
            isActive: true,
        });

        // Return the full public URL
        const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${token}`;

        return NextResponse.json({ url: publicUrl, expiresAt });
    } catch (error) {
        console.error("Share gen error:", error);
        return NextResponse.json({ error: "Failed to generate link" }, { status: 500 });
    }
}
