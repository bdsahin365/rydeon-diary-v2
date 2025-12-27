"use server";

import dbConnect from "@/lib/mongodb";
import Job, { IJob } from "@/models/Job";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { parse, isWithinInterval, isValid } from "date-fns";
import { categorizeTimeOfDay } from "@/lib/time-utils";

export async function getJobs(
    filter?: string,
    dateFrom?: string,
    dateTo?: string,
    paymentStatus?: string,
    timeOfDay?: string,
    searchQuery?: string,
    operator?: string
) {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    await dbConnect();
    try {
        let query: any = { userId: session.user.id };
        if (filter && filter !== 'all') {
            query.status = filter;
        } else {
            query.status = { $ne: 'archived' };
        }

        // Fetch all matching jobs first
        let jobs;
        if (filter === 'scheduled') {
            jobs = await Job.find(query).sort({ bookingDate: 1, bookingTime: 1 }).lean();
        } else {
            jobs = await Job.find(query).sort({ createdAt: -1 }).lean();
        }

        // Filter by date range if provided
        if (dateFrom && dateTo) {
            jobs = jobs.filter((job: any) => {
                if (!job.bookingDate) return false;

                try {
                    // Parse the booking date (DD/MM/YYYY format)
                    const bookingDate = parse(job.bookingDate, 'dd/MM/yyyy', new Date());
                    if (!isValid(bookingDate)) return false;

                    // Parse date range parameters
                    const fromDate = parse(dateFrom, 'dd/MM/yyyy', new Date());
                    const toDate = parse(dateTo, 'dd/MM/yyyy', new Date());

                    if (!isValid(fromDate) || !isValid(toDate)) return false;

                    // Check if booking date is within range (inclusive)
                    return isWithinInterval(bookingDate, { start: fromDate, end: toDate });
                } catch (e) {
                    console.error("Error parsing date:", e);
                    return false;
                }
            });
        }

        // Filter by payment status if provided
        if (paymentStatus && paymentStatus !== 'all') {
            jobs = jobs.filter((job: any) => job.paymentStatus === paymentStatus);
        }

        if (timeOfDay && timeOfDay !== 'all') {
            jobs = jobs.filter((job: any) => {
                if (!job.bookingTime) return false;
                const calculatedCategory = categorizeTimeOfDay(job.bookingTime);
                return calculatedCategory === timeOfDay;
            });
        }

        // Filter by operator if provided
        if (operator && operator !== 'all') {
            jobs = jobs.filter((job: any) => job.operator === operator);
        }

        // Filter by search query if provided
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase().trim();
            jobs = jobs.filter((job: any) => {
                return (
                    (job.customerName && job.customerName.toLowerCase().includes(lowerQuery)) ||
                    (job.pickup && job.pickup.toLowerCase().includes(lowerQuery)) ||
                    (job.dropoff && job.dropoff.toLowerCase().includes(lowerQuery)) ||
                    (job.jobRef && job.jobRef.toLowerCase().includes(lowerQuery)) ||
                    (job.notes && job.notes.toLowerCase().includes(lowerQuery)) ||
                    (job.vehicle && job.vehicle.toLowerCase().includes(lowerQuery)) ||
                    (job.operator && job.operator.toLowerCase().includes(lowerQuery))
                );
            });
        }

        return JSON.parse(JSON.stringify(jobs));
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return [];
    }
}

export async function getJobCounts() {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            all: 0,
            scheduled: 0,
            completed: 0,
            cancelled: 0,
            archived: 0
        };
    }
    await dbConnect();

    try {
        const counts = await Job.aggregate([
            { $match: { userId: session.user.id } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const result = {
            all: 0,
            scheduled: 0,
            completed: 0,
            cancelled: 0,
            archived: 0
        };

        let allCount = 0;
        counts.forEach((item: any) => {
            const status = item._id || 'unknown';
            if (status !== 'archived') {
                allCount += item.count;
            }
            if (Object.prototype.hasOwnProperty.call(result, status)) {
                (result as any)[status] = item.count;
            }
        });

        result.all = allCount;
        return result;
    } catch (error) {
        console.error("Error fetching job counts:", error);
        return {
            all: 0,
            scheduled: 0,
            completed: 0,
            cancelled: 0,
            archived: 0
        };
    }
}

export async function getUniqueOperators() {
    const session = await auth();
    if (!session?.user?.id) return [];

    await dbConnect();
    try {
        const operators = await Job.distinct('operator', {
            userId: session.user.id,
            operator: { $ne: null }
        });

        // Filter out empty strings and sort
        return operators
            .filter(op => op && op.trim() !== '')
            .sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error("Error fetching unique operators:", error);
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
        // Generate unique job ID: RYDE<DDMMYYYY>-<Index>
        let bookingDate = data.bookingDate || new Date().toLocaleDateString('en-GB');

        // Ensure date is in DD/MM/YYYY format for ID generation
        // Handle YYYY-MM-DD
        if (bookingDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = bookingDate.split('-');
            bookingDate = `${d}/${m}/${y}`;
        }

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
            if (lastJobRef) {
                const lastIndex = parseInt(lastJobRef.split('-')[1] || '0');
                index = lastIndex + 1;
            }
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
                dropoff: job.dropoff,
                customerName: job.customerName
            }))
        };
    } catch (error) {
        console.error("Error checking job overlap:", error);
        return { overlapping: false, jobs: [] };
    }
}

export async function checkDuplicateJob(
    bookingDate: string,
    bookingTime: string,
    customerName: string,
    price: number
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { isDuplicate: false };
    }

    if (!bookingDate || !bookingTime || !customerName) {
        return { isDuplicate: false };
    }

    await dbConnect();
    try {
        const query = {
            userId: session.user.id,
            bookingDate,
            bookingTime,
            customerName: { $regex: new RegExp(`^${customerName}$`, 'i') }, // Case insensitive exact match
            status: { $ne: 'archived' },
            $or: [
                { price: price.toString() },
                { price: price },
                { fare: price }
            ]
        };

        const duplicateJob = await Job.findOne(query);

        return {
            isDuplicate: !!duplicateJob,
            jobId: duplicateJob?._id.toString()
        };
    } catch (error) {
        console.error("Error checking duplicate job:", error);
        return { isDuplicate: false };
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
