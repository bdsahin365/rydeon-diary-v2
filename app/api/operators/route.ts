import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

import Operator from "@/models/Operator";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    try {
        console.log(`Fetching operators for user: ${session.user.id}`);
        const operators = await Operator.find({
            $or: [
                { userId: session.user.id },
                { userId: { $exists: false } },
                { userId: null }
            ]
        });
        console.log(`Found ${operators.length} operators`);
        return NextResponse.json(operators);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch operators" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    try {
        const body = await req.json();
        const operator = await Operator.create({ ...body, userId: session.user.id });
        return NextResponse.json(operator);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create operator" }, { status: 500 });
    }
}
