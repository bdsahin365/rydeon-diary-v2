import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const data = await req.json();
        const { id } = await params;

        await dbConnect();

        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { $set: data },
            { new: true }
        );

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        return NextResponse.json(vehicle);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await dbConnect();

        const vehicle = await Vehicle.findOneAndDelete({ _id: id, userId: session.user.id });

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Vehicle deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
    }
}
