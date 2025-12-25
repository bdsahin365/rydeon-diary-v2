'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";
import User from "@/models/User";

export async function getJobUsage() {
    const session = await auth();

    if (!session?.user?.id) {
        return { count: 0, limit: 100, plan: 'free', error: 'Unauthorized' };
    }

    try {
        await dbConnect();

        // Fetch user to get current plan
        const user = await User.findById(session.user.id);
        const plan = user?.plan || 'free';
        const limit = (plan === 'pro' || plan === 'business') ? Infinity : 100;

        const count = await Job.countDocuments({ userId: session.user.id });

        return {
            count,
            limit,
            plan,
            isLimitReached: plan !== 'pro' && count >= limit
        };
    } catch (error) {
        console.error("Error fetching job usage:", error);
        return { count: 0, limit: 100, plan: 'free', error: 'Failed to fetch usage' };
    }
}
