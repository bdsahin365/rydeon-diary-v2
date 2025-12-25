import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import DriverProfile from "@/models/DriverProfile";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const vehicles = await Vehicle.find({ userId: session.user.id });
        return NextResponse.json(vehicles);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const data = await req.json();

        await dbConnect();

        let driverProfile = await DriverProfile.findOne({ userId: session.user.id });
        if (!driverProfile) {
            driverProfile = await DriverProfile.create({ userId: session.user.id });
        }

        const vehicle = await Vehicle.create({
            userId: session.user.id,
            driverId: driverProfile._id,
            ...data
        });

        return NextResponse.json(vehicle, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
    }
}
