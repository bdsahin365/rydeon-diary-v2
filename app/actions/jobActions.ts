"use server";

import dbConnect from "@/lib/mongodb";
import Job, { IJob } from "@/models/Job";
import { revalidatePath } from "next/cache";
import { generateJobRef } from "@/lib/job-utils";
import { auth } from "@/auth";
import { parse, isWithinInterval, isValid, format } from "date-fns";
import { categorizeTimeOfDay } from "@/lib/time-utils";
import { parsePrice, getJobPrice } from "@/lib/price-utils";

export async function exportJobs(
    type: 'current' | 'custom',
    filters: {
        filter?: string;
        paymentStatus?: string;
        timeOfDay?: string;
        search?: string;
        operator?: string;
        dateFrom?: string; // DD/MM/YYYY
        dateTo?: string;   // DD/MM/YYYY
    },
    customRange?: {
        from: Date;
        to: Date;
    }
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    let jobs = [];

    if (type === 'custom' && customRange) {
        // For custom range, we ignore other filters and only use the date range
        // We need to format the dates to DD/MM/YYYY string for getJobs
        const fromStr = format(customRange.from, 'dd/MM/yyyy');
        const toStr = format(customRange.to, 'dd/MM/yyyy');

        jobs = await getJobs(undefined, fromStr, toStr, undefined, undefined, undefined, undefined);
    } else {
        // For current view, use provided filters
        jobs = await getJobs(
            filters.filter,
            filters.dateFrom,
            filters.dateTo,
            filters.paymentStatus,
            filters.timeOfDay,
            filters.search,
            filters.operator
        );
    }

    // Convert to CSV
    if (!jobs || jobs.length === 0) {
        return { csv: "" };
    }

    // Define headers and fields
    const headers = [
        "Job Ref",
        "Booking Date",
        "Time",
        "Customer",
        "Pickup",
        "Dropoff",
        "Vehicle",
        "Price",
        "Cost",
        "Profit",
        "Operator",
        "Flight Number",
        "Status",
        "Payment"
    ];

    const escapeCsv = (str: string | number | undefined | null) => {
        if (str === null || str === undefined) return "";
        const stringValue = String(str);
        if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const rows = jobs.map((job: any) => {
        // Robust price calculation matching metrics logic
        const priceValue = getJobPrice(job);

        // Format as simply the value, or keep currency symbol if preferred? 
        // User likely wants just the number or consistent formatting. 
        // Let's stick to the raw value or parsed value. 
        // If we want to mimic the previous string behavior but with "0" check:
        // Actually, CSV usually prefers raw numbers or consistent currency.
        // Let's export the determined numeric value formatted to 2 decimals if it's a number.
        const displayPrice = priceValue > 0 ? priceValue.toFixed(2) : "0.00";
        const profitValue = job.profit || 0;
        const displayProfit = profitValue.toFixed(2);

        // Calculate Cost = Price - Profit (if price is available)
        // If price is 0, cost is likely 0 or undefined.
        // Assuming Cost means "Cost to Company" or "Check / Price Paid to Driver"
        const costValue = Math.max(0, priceValue - profitValue);
        const displayCost = costValue.toFixed(2);

        return [
            job.jobRef,
            job.bookingDate,
            job.bookingTime,
            job.customerName,
            job.pickup,
            job.dropoff,
            job.vehicle,
            displayPrice,
            displayCost,
            displayProfit,
            job.operator,
            job.flightNumber,
            job.status,
            job.paymentStatus
        ].map(escapeCsv).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    return { csv };
}


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
        // Apply filter
        if (filter && filter !== 'all') {
            if (filter === 'no_show') {
                query.noShowAt = { $exists: true, $ne: null };
            } else if (filter === 'cancelled') {
                query.status = 'cancelled';
                // Exclude no-shows (must not exist or be null)
                query.$or = [{ noShowAt: { $exists: false } }, { noShowAt: null }];
            } else {
                query.status = filter;
            }
        } else {
            query.status = { $ne: 'archived' };
        }

        // Fetch all matching jobs first
        let jobs = await Job.find(query).lean();

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
            if (operator === 'Unknown') {
                jobs = jobs.filter((job: any) => !job.operator || job.operator.trim() === '');
            } else {
                jobs = jobs.filter((job: any) => job.operator === operator);
            }
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

        // Sort jobs by date/time
        jobs.sort((a: any, b: any) => {
            const getDate = (job: any) => {
                if (!job.bookingDate) return 0;
                try {
                    const date = parse(job.bookingDate, 'dd/MM/yyyy', new Date());
                    if (!isValid(date)) return 0;

                    if (job.bookingTime) {
                        const [h, m] = job.bookingTime.split(':').map((n: string) => parseInt(n) || 0);
                        date.setHours(h, m, 0, 0);
                    }
                    return date.getTime();
                } catch {
                    return 0;
                }
            };

            const timeA = getDate(a);
            const timeB = getDate(b);

            // Sort 'scheduled' jobs and default 'all' view by upcoming date (Ascending)
            // But usually 'all' might contain history. 
            // Given the user request "upcoming first", they likely want to see near future.

            if (filter === 'scheduled') {
                return timeA - timeB;
            }
            // For other views (completed, etc), usually most recent is better
            return timeB - timeA;
        });

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
            archived: 0,
            no_show: 0
        };
    }
    await dbConnect();

    try {
        // Fetch all jobs for the user to perform custom counting logic
        const jobs = await Job.find({ userId: session.user.id }).lean();

        const result = {
            all: 0,
            scheduled: 0,
            completed: 0,
            cancelled: 0,
            archived: 0,
            no_show: 0
        };

        jobs.forEach((job: any) => {
            // Increment 'all' count for non-archived jobs
            if (job.status !== 'archived') {
                result.all++;
            }

            // Apply custom counting logic for specific statuses
            if (job.status === 'completed') {
                result.completed++;
            } else if (job.noShowAt) { // Check for noShowAt first to make it mutually exclusive with cancelled
                result.no_show++;
            } else if (job.status === 'cancelled') {
                result.cancelled++;
            } else if (job.status === 'scheduled') {
                result.scheduled++;
            } else if (job.status === 'archived') {
                result.archived++;
            }
            // Other statuses (e.g., 'pending') would fall through if not explicitly handled
        });

        return result;
    } catch (error) {
        console.error("Error fetching job counts:", error);
        return {
            all: 0,
            scheduled: 0,
            completed: 0,
            cancelled: 0,
            archived: 0,
            no_show: 0
        };
    }
}

export async function getUniqueOperators() {
    const session = await auth();
    if (!session?.user?.id) return [];

    await dbConnect();
    try {
        const operators = await Job.distinct('operator', {
            userId: session.user.id
        });

        const validOperators = operators
            .filter(op => op && op.trim() !== '')
            .sort((a, b) => a.localeCompare(b));

        const hasUnknown = operators.some(op => !op || op.trim() === '');
        if (hasUnknown) {
            validOperators.push('Unknown');
        }

        return validOperators;
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
                userId: session.user.id,
                jobRef: "RYDE10092025-1"
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
                userId: session.user.id,
                jobRef: "RYDE29072025-1"
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
                userId: session.user.id,
                jobRef: "RYDE28072025-1"
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

        const jobRef = await generateJobRef(bookingDate);

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
                { fare: price },
                { parsedPrice: price }
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

export async function backfillJobRefs() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await dbConnect();
    try {
        const jobs = await Job.find({
            userId: session.user.id,
            $or: [{ jobRef: { $exists: false } }, { jobRef: "" }, { jobRef: null }]
        }).sort({ bookingDate: 1, createdAt: 1 });

        let updatedCount = 0;

        // Group jobs by date to maintain index correctly
        const jobsByDate: Record<string, any[]> = {};

        // First pass: organize jobs by date
        for (const job of jobs) {
            let bookingDate = job.bookingDate;
            if (!bookingDate) continue; // Skip if no date

            // Normalize date to DD/MM/YYYY
            if (bookingDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [y, m, d] = bookingDate.split('-');
                bookingDate = `${d}/${m}/${y}`;
            }

            if (!jobsByDate[bookingDate]) {
                jobsByDate[bookingDate] = [];
            }
            jobsByDate[bookingDate].push(job);
        }

        // Second pass: generate IDs and update
        for (const [date, dateJobs] of Object.entries(jobsByDate)) {
            const [day, month, year] = date.split('/');
            const dateStr = `${day}${month}${year}`;

            // Find existing max index for this date GLOBALLY to avoid collisions
            const existingJobs = await Job.find({
                jobRef: { $regex: `^RYDE${dateStr}` }
            });

            let startIndex = 1;
            if (existingJobs.length > 0) {
                const indices = existingJobs.map(j => {
                    if (!j.jobRef) return 0;
                    const parts = j.jobRef.split('-');
                    return parts.length > 1 ? parseInt(parts[1]) : 0;
                });
                startIndex = Math.max(...indices) + 1;
            }

            for (let i = 0; i < dateJobs.length; i++) {
                const job = dateJobs[i];
                const jobRef = `RYDE${dateStr}-${startIndex + i}`;

                await Job.updateOne(
                    { _id: job._id },
                    { $set: { jobRef } }
                );
                updatedCount++;
            }
        }

        revalidatePath("/my-jobs");
        return { success: true, count: updatedCount };
    } catch (error) {
        console.error("Error backfilling job refs:", error);
        return { error: "Failed to backfill job refs" };
    }
}
