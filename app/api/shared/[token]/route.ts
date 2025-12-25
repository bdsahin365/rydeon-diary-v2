import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SharedLink from "@/models/SharedLink";
import DriverProfile from "@/models/DriverProfile";
import Document from "@/models/Document";
import Vehicle from "@/models/Vehicle";
import User from "@/models/User";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;
        if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

        await dbConnect();

        const link = await SharedLink.findOne({ token, isActive: true });

        if (!link) {
            return NextResponse.json({ error: "Invalid or inactive link" }, { status: 404 });
        }

        if (new Date() > new Date(link.expiresAt)) {
            return NextResponse.json({ error: "Link expired" }, { status: 410 });
        }

        // Track view
        await SharedLink.findByIdAndUpdate(link._id, {
            $inc: { viewCount: 1 },
            lastViewedAt: new Date()
        });

        const data: any = {};

        // Fetch based on permissions
        if (link.sections.includes('profile_overview')) {
            const profile = await DriverProfile.findById(link.driverProfileId);
            const user = await User.findById(link.userId).select('name image email');
            data.profile = { ...profile.toObject(), user };
        }

        if (link.sections.includes('documents')) {
            const docs = await Document.find({ userId: link.userId }).select('-metadata'); // Hide internal metadata if needed
            data.documents = docs;
        }

        if (link.sections.includes('vehicle')) {
            const vehicles = await Vehicle.find({ driverId: link.driverProfileId });
            data.vehicles = vehicles;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Shared access error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
