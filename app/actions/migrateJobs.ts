"use server";

import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";
import { categorizeTimeOfDay } from "@/lib/time-utils";
import { auth } from "@/auth";

/**
 * Migration script to add timeOfDay to all existing jobs
 * Run this once to categorize all existing jobs
 */
export async function migrateJobsTimeOfDay() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    await dbConnect();

    try {
        // Find all jobs for the current user that don't have timeOfDay set
        const jobs = await Job.find({
            userId: session.user.id,
            $or: [
                { timeOfDay: { $exists: false } },
                { timeOfDay: null }
            ]
        });

        console.log(`Found ${jobs.length} jobs to migrate`);

        let updated = 0;
        let skipped = 0;

        for (const job of jobs) {
            if (job.bookingTime) {
                const timeOfDay = categorizeTimeOfDay(job.bookingTime);
                await Job.updateOne(
                    { _id: job._id },
                    { $set: { timeOfDay } }
                );
                updated++;
            } else {
                // Skip jobs without booking time
                skipped++;
            }
        }

        console.log(`Migration complete: ${updated} updated, ${skipped} skipped`);

        return {
            success: true,
            total: jobs.length,
            updated,
            skipped
        };
    } catch (error) {
        console.error("Error migrating jobs:", error);
        return { error: "Failed to migrate jobs" };
    }
}
