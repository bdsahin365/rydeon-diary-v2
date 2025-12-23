"use server";

import dbConnect from "@/lib/mongodb";
import Job, { IJob } from "@/models/Job";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getJobs(filter?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    await dbConnect();
    try {
        let query: any = { userId: session.user.id };
        if (filter && filter !== 'all') {
            query.status = filter;
        }

        // For scheduled/upcoming jobs, sort by booking date and time (ascending - next job first)
        // For other statuses, sort by creation date (descending - newest first)
        let jobs;
        if (filter === 'scheduled') {
            jobs = await Job.find(query).sort({ bookingDate: 1, bookingTime: 1 });
        } else {
            jobs = await Job.find(query).sort({ createdAt: -1 });
        }

        return JSON.parse(JSON.stringify(jobs));
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return [];
    }
}

export async function seedJobs(formData?: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        console.error("seedJobs: No user logged in");
        return;
    }

    console.log("seedJobs: Starting seed process for user:", session.user.id);
    await dbConnect();
    try {
        // Clear existing data for THIS user
        console.log("seedJobs: Clearing existing jobs...");
        await Job.deleteMany({ userId: session.user.id });

        const jobs = [
            {
                customerName: "ANGELICA PARTON",
                status: "completed",
                bookingDate: "10/09/2025",
                bookingTime: "08:30",
                pickup: "10 NEW DRUM STREET LONDON E1 7AT",
                dropoff: "EXCEL 1 WESTERN GATEWAY LONDON E16 1XL",
                vehicle: "MPV",
                distance: "6.9 mi",
                duration: "24 mins",
                price: "60",
                profit: 57.96,
                paymentStatus: "overdue",
                customerPhone: "+27765974178",
                originalFirebaseId: "-OZk6RbH_MaEExQpJjK1",
                userId: session.user.id
            },
            {
                customerName: "John Doe",
                status: "scheduled",
                bookingDate: "29/07/2025",
                bookingTime: "16:30",
                pickup: "London Standsted Airport",
                dropoff: "Norfolk Towers Paddington",
                vehicle: "MPV 6",
                distance: "50 mi",
                price: "65.00",
                profit: 54.00,
                paymentStatus: "unpaid",
                notes: "Flight landing at 16:00",
                userId: session.user.id
            },
            {
                customerName: "Jane Smith",
                status: "completed",
                bookingDate: "28/07/2025",
                bookingTime: "10:00",
                pickup: "Heathrow Terminal 5",
                dropoff: "Central London",
                vehicle: "Saloon",
                distance: "18 mi",
                price: "45.00",
                profit: 35.00,
                paymentStatus: "paid",
                userId: session.user.id
            }
        ];

        console.log("seedJobs: Inserting jobs...");
        await Job.insertMany(jobs);
        console.log("Jobs seeded successfully");
        revalidatePath("/my-jobs");
    } catch (error) {
        console.error("Error seeding jobs:", error);
    }
}

export async function deleteJob(jobId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await dbConnect();
    try {
        await Job.findOneAndDelete({ _id: jobId, userId: session.user.id });
        revalidatePath("/my-jobs");
        return { success: true };
    } catch (error) {
        console.error("Error deleting job:", error);
        return { error: "Failed to delete job" };
    }
}

export async function archiveJob(jobId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await dbConnect();
    try {
        await Job.findOneAndUpdate(
            { _id: jobId, userId: session.user.id },
            { status: 'archived' }
        );
        revalidatePath("/my-jobs");
        return { success: true };
    } catch (error) {
        console.error("Error archiving job:", error);
        return { error: "Failed to archive job" };
    }
}

export async function updateJob(jobId: string, data: Partial<IJob>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await dbConnect();
    try {
        // Remove _id from data if present to avoid immutable field error
        const { _id, userId, ...updateData } = data as any;

        await Job.findOneAndUpdate(
            { _id: jobId, userId: session.user.id },
            { $set: updateData },
            { new: true }
        );
        revalidatePath("/my-jobs");
        return { success: true };
    } catch (error) {
        console.error("Error updating job:", error);
        return { error: "Failed to update job" };
    }
}

export async function createJob(data: Partial<IJob>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await dbConnect();
    try {
        // Generate unique job ID: RYDE<DDMMYYYY>-<Index>
        const bookingDate = data.bookingDate || new Date().toLocaleDateString('en-GB');
        const [day, month, year] = bookingDate.split('/');
        const dateStr = `${day}${month}${year}`;

        // Find jobs for this date to determine index
        const jobsForDate = await Job.find({
            userId: session.user.id,
            jobRef: { $regex: `^RYDE${dateStr}` }
        }).sort({ jobRef: -1 });

        let index = 1;
        if (jobsForDate.length > 0) {
            const lastJobRef = jobsForDate[0].jobRef;
            const lastIndex = parseInt(lastJobRef.split('-')[1] || '0');
            index = lastIndex + 1;
        }

        const jobRef = `RYDE${dateStr}-${index}`;

        // Check for overlapping jobs
        const overlapCheck = await checkJobOverlap(
            data.bookingDate || '',
            data.bookingTime || '',
            data.duration || '',
            undefined // no jobId for new jobs
        );

        const newJob = new Job({
            ...data,
            jobRef,
            userId: session.user.id
        });

        await newJob.save();
        revalidatePath("/my-jobs");

        return {
            success: true,
            jobRef,
            overlappingJobs: overlapCheck.overlapping ? overlapCheck.jobs : []
        };
    } catch (error) {
        console.error("Error creating job:", error);
        return { error: "Failed to create job" };
    }
}

export async function checkJobOverlap(
    bookingDate: string,
    bookingTime: string,
    duration: string,
    excludeJobId?: string
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { overlapping: false, jobs: [] };
    }

    if (!bookingDate || !bookingTime) {
        return { overlapping: false, jobs: [] };
    }

    await dbConnect();
    try {
        // Parse duration (e.g., "24 mins" or "1 hr 15 mins")
        const durationInMinutes = parseDuration(duration);

        // Calculate job end time
        const [hours, minutes] = bookingTime.split(':').map(Number);
        const startTime = hours * 60 + minutes; // in minutes from midnight
        const endTime = startTime + durationInMinutes;

        // Find all jobs on the same date
        const query: any = {
            userId: session.user.id,
            bookingDate,
            status: { $in: ['scheduled', 'in-progress'] } // Only check active jobs
        };

        if (excludeJobId) {
            query._id = { $ne: excludeJobId };
        }

        const jobsOnDate = await Job.find(query);

        const overlappingJobs = jobsOnDate.filter((job: any) => {
            if (!job.bookingTime || !job.duration) return false;

            const [jobHours, jobMinutes] = job.bookingTime.split(':').map(Number);
            const jobStartTime = jobHours * 60 + jobMinutes;
            const jobDurationInMinutes = parseDuration(job.duration);
            const jobEndTime = jobStartTime + jobDurationInMinutes;

            // Check if time ranges overlap
            return (startTime < jobEndTime && endTime > jobStartTime);
        });

        return {
            overlapping: overlappingJobs.length > 0,
            jobs: overlappingJobs.map((job: any) => ({
                jobRef: job.jobRef,
                _id: job._id.toString(),
                bookingTime: job.bookingTime,
                duration: job.duration,
                pickup: job.pickup,
                dropoff: job.dropoff
            }))
        };
    } catch (error) {
        console.error("Error checking job overlap:", error);
        return { overlapping: false, jobs: [] };
    }
}

function parseDuration(duration: string): number {
    if (!duration) return 0;

    let totalMinutes = 0;
    const hourMatch = duration.match(/(\d+)\s*h/i);
    const minMatch = duration.match(/(\d+)\s*m/i);

    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minMatch) totalMinutes += parseInt(minMatch[1]);

    return totalMinutes || 0;
}
