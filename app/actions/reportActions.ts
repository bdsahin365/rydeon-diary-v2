"use server";

import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";
import { auth } from "@/auth";
import { parseJobDate } from "@/lib/utils";
import { parsePrice, getJobPrice } from "@/lib/price-utils";
import { startOfDay, endOfDay, format } from "date-fns";

export async function getExportData(dateFrom?: Date, dateTo?: Date) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    await dbConnect();

    try {
        const query: any = {
            userId: session.user.id,
            status: 'completed'
        };

        const jobs = await Job.find(query).lean();

        // Filter in memory for precise date handling matching dashboard
        const filteredJobs = jobs.filter((job: any) => {
            const d = parseJobDate(job.bookingDate);
            if (!d) return false;

            if (dateFrom && d < startOfDay(dateFrom)) return false;
            if (dateTo && d > endOfDay(dateTo)) return false;

            return true;
        });

        // Format for export
        const exportData = filteredJobs.map((job: any) => {
            const price = getJobPrice(job);
            const operatorFee = job.operatorFeeAmount || 0;
            const airportFee = job.airportFee || 0;
            const profit = job.profit || (price - operatorFee - airportFee);

            return {
                Date: format(parseJobDate(job.bookingDate)!, 'dd/MM/yyyy'),
                Time: job.bookingTime || 'N/A',
                Ref: job.jobRef || 'N/A',
                Vehicle: job.vehicle || 'Unknown',
                Operator: job.operator || 'Unknown',
                Pickup: job.pickup || 'N/A',
                Dropoff: job.dropoff || 'N/A',
                Price: price,
                "Operator Fee": operatorFee,
                "Airport Fee": airportFee,
                Profit: profit,
                "Payment Status": job.paymentStatus || 'Unpaid'
            };
        });

        // Sort by date desc
        exportData.sort((a, b) => {
            // Simple string sort for DD/MM/YYYY might fail, but let's rely on dashboard sort logic usually.
            // Better to sort inputs first.
            // Re-parsing date for sort:
            const da = new Date(a.Date.split('/').reverse().join('-'));
            const db = new Date(b.Date.split('/').reverse().join('-'));
            return db.getTime() - da.getTime();
        });

        return { data: exportData };

    } catch (error) {
        console.error("Error fetching export data:", error);
        return { error: "Failed to fetch export data" };
    }
}
