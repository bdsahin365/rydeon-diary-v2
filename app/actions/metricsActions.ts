"use server";

import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";
import { auth } from "@/auth";
import { startOfMonth, subMonths, startOfWeek, subDays, format, parse, isValid, differenceInMinutes, startOfDay, endOfDay } from "date-fns";
import { parsePrice, parseJobDate } from "@/lib/utils";

export async function getStatsSummary() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const userId = session.user.id;

    await dbConnect();
    const now = new Date();
    const firstDayOfMonth = startOfMonth(now);
    const firstDayOfLastMonth = startOfMonth(subMonths(now, 1));

    try {
        const jobs = await Job.find({
            userId,
            status: 'completed',
            // Ideally we filter by date here, but for now fetch all completed to calculate month stats locally
            // or do aggregation. Let's do aggregation for performance.
        }).lean();

        // Let's filter in memory for now to handle custom string parsing if needed, 
        // or refine the query if bookingDate is strictly formatted.
        // Assuming bookingDate is 'DD/MM/YYYY' string or Date object.

        let totalRevenue = 0;
        let totalProfit = 0;
        let totalJobs = 0;
        let totalDistance = 0;
        let totalDurationMins = 0;

        let currentMonthRevenue = 0;
        let lastMonthRevenue = 0;

        jobs.forEach((job: any) => {
            const price = (typeof job.fare === 'number' ? job.fare : 0) || (typeof job.parsedPrice === 'number' ? job.parsedPrice : 0) || (typeof job.price === 'number' ? job.price : parsePrice(job.price));
            // Calculate Profit: Price - Operator Fee - Airport Fee
            // Note: Profit field might be pre-calculated in DB, but let's recalculate to be safe or use it
            const profit = job.profit || (price - (job.operatorFeeAmount || 0) - (job.airportFee || 0)); // Simplified

            const dateStr = job.bookingDate;
            let jobDate: Date | null = null;

            if (dateStr instanceof Date) jobDate = dateStr;
            else if (typeof dateStr === 'string') {
                jobDate = parseJobDate(dateStr) || null;
            }

            if (jobDate) {
                // All-time stats accumulation
                totalRevenue += price;
                totalProfit += profit;
                totalJobs += 1;

                // Distance & Duration
                if (job.distance) {
                    const dist = parseFloat(job.distance.toString().replace(/[^\d.]/g, '')) || 0;
                    totalDistance += dist;
                }
                if (job.duration) {
                    let mins = 0;
                    const h = job.duration.match(/(\d+)\s*h/);
                    const m = job.duration.match(/(\d+)\s*m/);
                    if (h) mins += parseInt(h[1]) * 60;
                    if (m) mins += parseInt(m[1]);
                    if (!h && !m && !isNaN(parseInt(job.duration))) mins = parseInt(job.duration);
                    totalDurationMins += mins;
                }

                // Trend Calculation Logic (Monthly)
                if (jobDate >= firstDayOfMonth) {
                    currentMonthRevenue += price;
                } else if (jobDate >= firstDayOfLastMonth && jobDate < firstDayOfMonth) {
                    lastMonthRevenue += price;
                }
            } else {
                console.log(`[REV] Excluded Job (Invalid Date): ${job.customerName} | Date: ${job.bookingDate}`);
            }
        });
        console.log(`[REV] Total Revenue: ${totalRevenue}`);

        // Calculate efficiency (Hourly Rate)
        const hourlyRate = totalDurationMins > 0 ? (totalRevenue / (totalDurationMins / 60)) : 0;

        // Calculate trends
        const revenueTrend = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        return {
            revenue: { value: totalRevenue, trend: revenueTrend },
            profit: { value: totalProfit },
            jobs: { value: totalJobs },
            distance: { value: totalDistance, unit: 'mi' },
            efficiency: { value: hourlyRate, unit: '/hr' }
        };

    } catch (error) {
        console.error("Error fetching stats:", error);
        return { error: "Failed to fetch stats" };
    }
}

export async function getEarningsHistory(range: '7d' | '30d' | '12m' = '30d') {
    const session = await auth();
    if (!session?.user?.id) return [];
    await dbConnect();

    // Mocking logic vs Aggregation. 
    // Aggregation is better.
    // We need to group by bookingDate.

    // For simplicity and robustness with string dates, let's fetch and map.
    const jobs = await Job.find({
        userId: session.user.id,
        status: 'completed'
    }).select('bookingDate price profit').lean();

    const dataMap = new Map<string, { revenue: number, profit: number }>();
    const now = new Date();
    let startDate: Date;

    if (range === '7d') startDate = subDays(now, 7);
    else if (range === '12m') startDate = subMonths(now, 12);
    else startDate = subDays(now, 30);

    // Initialize map with empty days/months
    if (range !== '12m') {
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
            dataMap.set(format(d, 'dd/MM'), { revenue: 0, profit: 0 });
        }
    } else {
        // For 12m, key is MMM
        for (let i = 0; i < 12; i++) {
            const d = subMonths(now, 11 - i);
            dataMap.set(format(d, 'MMM'), { revenue: 0, profit: 0 });
        }
    }

    jobs.forEach((job: any) => {
        let date: Date | undefined;
        if (typeof job.bookingDate === 'string') {
            const p = parseJobDate(job.bookingDate);
            if (p) date = p;
        } else if (job.bookingDate instanceof Date) {
            date = job.bookingDate;
        }

        if (date && date >= startDate) {
            const price = (typeof job.fare === 'number' ? job.fare : 0) || (typeof job.parsedPrice === 'number' ? job.parsedPrice : 0) || (typeof job.price === 'number' ? job.price : parsePrice(job.price));
            const profit = job.profit || price; // Fallback

            let key = '';
            if (range === '12m') key = format(date, 'MMM');
            else key = format(date, 'dd/MM');

            // Find existing (or closest if we pre-filled)
            if (dataMap.has(key)) {
                const existing = dataMap.get(key)!;
                existing.revenue += price;
                existing.profit += profit;
                dataMap.set(key, existing); // primitive update
            }
        }
    });

    return Array.from(dataMap.entries()).map(([name, val]) => ({
        name,
        revenue: val.revenue,
        profit: val.profit
    }));
}

export async function getOperatorStats() {
    const session = await auth();
    if (!session?.user?.id) return [];
    await dbConnect();

    // Fetch jobs manually to handle messy price strings/mixed types safely
    const jobs = await Job.find({ userId: session.user.id, status: 'completed' }).select('operator price').lean();
    const map = new Map<string, { jobs: number, revenue: number }>();

    jobs.forEach((j: any) => {
        const op = j.operator || 'Unknown';
        const price = (typeof j.fare === 'number' ? j.fare : 0) || (typeof j.parsedPrice === 'number' ? j.parsedPrice : 0) || (typeof j.price === 'number' ? j.price : parsePrice(j.price));
        const curr = map.get(op) || { jobs: 0, revenue: 0 };
        curr.jobs += 1;
        curr.revenue += price;
        map.set(op, curr);
    });

    return Array.from(map.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5); // Top 5
}

export async function getRecentJobs() {
    const session = await auth();
    if (!session?.user?.id) return [];
    await dbConnect();

    // Sort by createdAt desc or bookingDate desc? Usually completed jobs sorted by bookingDate desc
    // But safely createdAt is easier. Let's try bookingDate for relevance.
    // String dates are hard to sort in Mongo.
    // Fetch last 20, sort manually, return top 5.

    const jobs = await Job.find({ userId: session.user.id, status: 'completed' })
        .sort({ _id: -1 }) // Proxy for recent creation/update usually
        .limit(20)
        .lean();

    // Client side sort by parsed date
    return jobs.sort((a: any, b: any) => {
        const dA = parseJobDate(a.bookingDate) || new Date(0);
        const dB = parseJobDate(b.bookingDate) || new Date(0);
        return dB.getTime() - dA.getTime();
    }).slice(0, 5).map((j: any) => ({
        ...j,
        _id: j._id.toString(),
        userId: j.userId.toString()
    }));
}

export async function getUpcomingJobs() {
    const session = await auth();
    if (!session?.user?.id) return [];
    await dbConnect();

    // Fetch scheduled
    const jobs = await Job.find({ userId: session.user.id, status: 'scheduled' }).lean();

    const now = new Date();
    // Sort ascending (nearest future first)
    return jobs
        .filter((j: any) => {
            const datePart = parseJobDate(j.bookingDate);
            if (!datePart) return false;
            // Best effort combine with time
            const d = parse(`${format(datePart, 'yyyy-MM-dd')} ${j.bookingTime}`, 'yyyy-MM-dd HH:mm', new Date());
            return isValid(d) && d >= now;
        })
        .sort((a: any, b: any) => {
            const dA = parseJobDate(a.bookingDate) || new Date(0);
            const dB = parseJobDate(b.bookingDate) || new Date(0);
            // Verify time sorting too if needed, but date is primary sort
            if (dA.getTime() !== dB.getTime()) return dA.getTime() - dB.getTime();

            // If same date, try time
            const timeA = parse(a.bookingTime, 'HH:mm', new Date());
            const timeB = parse(b.bookingTime, 'HH:mm', new Date());
            return timeA.getTime() - timeB.getTime();
        })
        .slice(0, 5)
        .map((j: any) => ({ ...j, _id: j._id.toString(), userId: j.userId.toString() }));
}

import { categorizeTimeOfDay } from "@/lib/time-utils";

export async function getReportStats() {
    const session = await auth();
    if (!session?.user?.id) return null;
    await dbConnect();

    try {
        const jobs = await Job.find({ userId: session.user.id }).lean();

        const stats = {
            total: 0,
            status: {
                scheduled: 0,
                completed: 0,
                cancelled: 0,
                archived: 0
            } as Record<string, number>,
            payment: {
                paid: 0,
                unpaid: 0,
                overdue: 0
            } as Record<string, number>,
            timeOfDay: {
                midnight: 0,
                day: 0,
                evening: 0
            } as Record<string, number>
        };

        jobs.forEach((job: any) => {
            stats.total++;

            // Status counts
            const status = job.status || 'unknown';
            if (stats.status[status] !== undefined) {
                stats.status[status]++;
            } else {
                // Initialize if not exists (e.g. 'in-progress' or unknown)
                stats.status[status] = (stats.status[status] || 0) + 1;
            }

            // Payment Status
            const payment = job.paymentStatus || 'unpaid';
            if (stats.payment[payment] !== undefined) {
                stats.payment[payment]++;
            } else {
                stats.payment[payment] = (stats.payment[payment] || 0) + 1;
            }

            // Time of Day
            if (job.bookingTime) {
                const category = categorizeTimeOfDay(job.bookingTime);
                if (stats.timeOfDay[category] !== undefined) {
                    stats.timeOfDay[category]++;
                }
            }
        });

        return stats;
    } catch (error) {
        console.error("Error fetching report stats:", error);
        return null;
    }
}
