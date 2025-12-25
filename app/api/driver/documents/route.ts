import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Document from "@/models/Document";
import DriverProfile from "@/models/DriverProfile";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const docs = await Document.find({ userId: session.user.id }).sort({ createdAt: -1 });

        return NextResponse.json(docs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { type, fileUrl, expiryDate, vehicleId } = data;

        if (!type || !fileUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // Find driver profile to link
        let driverProfile = await DriverProfile.findOne({ userId: session.user.id });
        if (!driverProfile) {
            // Auto-create if missing (shouldn't happen often in flow, but safe)
            driverProfile = await DriverProfile.create({ userId: session.user.id });
        }

        // Create doc
        const newDoc = await Document.create({
            userId: session.user.id,
            driverProfileId: driverProfile._id,
            vehicleId: vehicleId || undefined,
            type,
            fileUrl,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            status: 'uploaded' // Default status
        });

        // Trigger basic verification or status update here if needed (e.g. check if all mandatory docs are present)

        return NextResponse.json(newDoc, { status: 201 });
    } catch (error) {
        console.error("Create doc error:", error);
        return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
    }
}
