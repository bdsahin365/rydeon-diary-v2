import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";

import User from "@/models/User";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    try {
        // SaaS Limit Check
        const user = await User.findById(session.user.id);
        const plan = user?.plan || 'free';

        if (plan === 'free') {
            const jobCount = await Job.countDocuments({ userId: session.user.id });
            if (jobCount >= 100) {
                return NextResponse.json(
                    { error: "Free plan limit reached (100 jobs). Please upgrade to Pro." },
                    { status: 403 }
                );
            }
        }

        const body = await req.json();
        const job = await Job.create({ ...body, userId: session.user.id });
        return NextResponse.json(job);
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
    }
}
