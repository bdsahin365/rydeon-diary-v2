"use server";

import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";
import { auth } from "@/auth";
import { startOfMonth, subMonths, startOfWeek, subDays, format, parse, isValid, differenceInMinutes, startOfDay, endOfDay } from "date-fns";
import { parsePrice, parseJobDate } from "@/lib/utils";

export async function getStatsSummary(dateFrom?: Date, dateTo?: Date) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const userId = session.user.id;

    await dbConnect();
    await dbConnect();
    const now = new Date();
    // Use filters if provided, otherwise default to all time (or appropriate default) logic
    // But existing getStatsSummary logic was doing some month vs last month comparison.
    // If date filter is present, we might want to just show totals for that range, 
    // OR we change the comparison to be "this range vs previous range of same duration".
    // For now, let's keep it simple: if filtered, calculate stats for that specific range.
    // Comparison might be tricky, maybe just show value.

    try {
        const jobs = await Job.find({
            userId,
            status: { $in: ['completed', 'scheduled'] },
        }).lean();


        // Let's filter in memory for now to handle custom string parsing if needed, 
        // or refine the query if bookingDate is strictly formatted.
        // Assuming bookingDate is 'DD/MM/YYYY' string or Date object.

        let totalRevenue = 0;
        let totalScheduledRevenue = 0;
        let totalProfit = 0;
        let totalJobs = 0;
        let totalDistance = 0;
        let totalDurationMins = 0;

        let currentMonthRevenue = 0;
        let lastMonthRevenue = 0;

        jobs.forEach((job: any) => {
            const dateStr = job.bookingDate;
            let jobDate: Date | null = null;
            if (dateStr instanceof Date) jobDate = dateStr;
            else if (typeof dateStr === 'string') jobDate = parseJobDate(dateStr) || null;

            if (jobDate) {
                // Apply Date Filter if provided
                if (dateFrom && jobDate < startOfDay(dateFrom)) return;
                if (dateTo && jobDate > endOfDay(dateTo)) return;

                const price = (typeof job.fare === 'number' ? job.fare : 0) || (typeof job.parsedPrice === 'number' ? job.parsedPrice : 0) || (typeof job.price === 'number' ? job.price : parsePrice(job.price));

                if (job.status === 'scheduled') {
                    totalScheduledRevenue += price;
                } else if (job.status === 'completed') {
                    const profit = job.profit || (price - (job.operatorFeeAmount || 0) - (job.airportFee || 0));

                    // All-time (or Filtered Range) stats
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
                }
            }
        });

        // If filtering, we lose the "trend" relative to last month unless we explicitly calculate "previous period".
        // For simplicity now, if date filter is active, trend = 0.
        // If no filter, we rely on the original logic (implied all time? No, original logic was implicit).
        // Actually original logic did currentMonth vs LastMonth.
        // Let's preserve that ONLY if no filter is applied.

        let revenueTrend = 0;
        if (!dateFrom && !dateTo) {
            const firstDayOfMonth = startOfMonth(now);
            const firstDayOfLastMonth = startOfMonth(subMonths(now, 1));

            let currentMonthRevenue = 0;
            let lastMonthRevenue = 0;

            jobs.forEach((job: any) => {
                if (job.status !== 'completed') return;

                const d = parseJobDate(job.bookingDate);
                if (d) {
                    const p = (typeof job.fare === 'number' ? job.fare : 0) || (typeof job.parsedPrice === 'number' ? job.parsedPrice : 0) || (typeof job.price === 'number' ? job.price : parsePrice(job.price));
                    if (d >= firstDayOfMonth) currentMonthRevenue += p;
                    else if (d >= firstDayOfLastMonth && d < firstDayOfMonth) lastMonthRevenue += p;
                }
            })
            revenueTrend = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
        }

        const hourlyRate = totalDurationMins > 0 ? (totalRevenue / (totalDurationMins / 60)) : 0;

        return {
            revenue: { value: totalRevenue, trend: revenueTrend },
            scheduledRevenue: { value: totalScheduledRevenue },
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

export async function getEarningsHistory(range: '7d' | '30d' | '12m' | 'custom' = '30d', dateFrom?: Date, dateTo?: Date) {
    const session = await auth();
    if (!session?.user?.id) return [];
    await dbConnect();

    const jobs = await Job.find({
        userId: session.user.id,
        status: 'completed'
    }).select('bookingDate price profit').lean();

    const dataMap = new Map<string, { revenue: number, profit: number }>();
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now; // Default end is now

    if (dateFrom && dateTo) {
        // Custom Range
        startDate = dateFrom;
        endDate = dateTo;
    } else {
        if (range === '7d') startDate = subDays(now, 7);
        else if (range === '12m') startDate = subMonths(now, 12);
        else startDate = subDays(now, 30);
    }

    // Initialize map
    const shouldUseMonths = range === '12m' || (dateFrom && dateTo && differenceInMinutes(dateTo, dateFrom) > 60 * 24 * 90); // > 90 days use months? simple logic

    if (shouldUseMonths) {
        // For custom large ranges, dynamic initialization might be needed, but sticking to 12m logic for now or filtered entries.
        // Simpler: iterate existing jobs and fill. 
        // But user wants to see empty bars too.
        // Let's stick to generating keys based on start/end.
        let curr = new Date(startDate);
        while (curr <= endDate) {
            dataMap.set(format(curr, 'MMM yyyy'), { revenue: 0, profit: 0 });
            curr = new Date(curr.setMonth(curr.getMonth() + 1));
        }
    } else {
        let curr = new Date(startDate);
        while (curr <= endDate) {
            dataMap.set(format(curr, 'dd/MM'), { revenue: 0, profit: 0 });
            curr = new Date(curr.setDate(curr.getDate() + 1));
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

        if (date && date >= startOfDay(startDate) && date <= endOfDay(endDate)) {
            const price = (typeof job.fare === 'number' ? job.fare : 0) || (typeof job.parsedPrice === 'number' ? job.parsedPrice : 0) || (typeof job.price === 'number' ? job.price : parsePrice(job.price));
            const profit = job.profit || price;

            let key = '';
            if (shouldUseMonths) key = format(date, 'MMM yyyy');
            else key = format(date, 'dd/MM');

            // Find existing (or closest if we pre-filled)
            if (dataMap.has(key)) {
                const existing = dataMap.get(key)!;
                existing.revenue += price;
                existing.profit += profit;
                dataMap.set(key, existing);
            } else if (!shouldUseMonths && dateFrom && dateTo) {
                // If custom range and we missed one (e.g. slight mismatch), we can auto-add or ignore.
            }
        }
    });

    return Array.from(dataMap.entries()).map(([name, val]) => ({
        name,
        revenue: val.revenue,
        profit: val.profit
    }));
}

export async function getOperatorStats(dateFrom?: Date, dateTo?: Date) {
    const session = await auth();
    if (!session?.user?.id) return [];
    await dbConnect();

    // Fetch jobs manually to handle messy price strings/mixed types safely
    const jobs = await Job.find({ userId: session.user.id, status: 'completed' }).select('operator price bookingDate').lean();
    const map = new Map<string, { jobs: number, revenue: number }>();

    jobs.forEach((j: any) => {
        const d = parseJobDate(j.bookingDate);
        if (dateFrom && (!d || d < startOfDay(dateFrom))) return;
        if (dateTo && (!d || d > endOfDay(dateTo))) return;

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

export async function getVehicleStats(dateFrom?: Date, dateTo?: Date) {
    const session = await auth();
    if (!session?.user?.id) return [];
    await dbConnect();

    try {
        const jobs = await Job.find({ userId: session.user.id, status: 'completed' }).select('vehicle price bookingDate').lean();
        const map = new Map<string, { jobs: number, revenue: number }>();

        jobs.forEach((j: any) => {
            const d = parseJobDate(j.bookingDate);
            if (dateFrom && (!d || d < startOfDay(dateFrom))) return;
            if (dateTo && (!d || d > endOfDay(dateTo))) return;

            const v = j.vehicle || 'Unknown';
            const price = (typeof j.fare === 'number' ? j.fare : 0) || (typeof j.parsedPrice === 'number' ? j.parsedPrice : 0) || (typeof j.price === 'number' ? j.price : parsePrice(j.price));

            const curr = map.get(v) || { jobs: 0, revenue: 0 };
            curr.jobs += 1;
            curr.revenue += price;
            map.set(v, curr);
        });

        return Array.from(map.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
        console.error("Error fetching vehicle stats:", error);
        return [];
    }
}

export async function getReportStats(dateFrom?: Date, dateTo?: Date) {
    const session = await auth();
    if (!session?.user?.id) return null;
    await dbConnect();

    try {
        const jobs = await Job.find({ userId: session.user.id }).lean();

        const stats = {
            total: 0,
            status: {
                scheduled: { count: 0, value: 0 },
                completed: { count: 0, value: 0 },
                cancelled: { count: 0, value: 0 },
                archived: { count: 0, value: 0 }
            } as Record<string, { count: number, value: number }>,
            payment: {
                paid: { count: 0, value: 0 },
                unpaid: { count: 0, value: 0 },
                overdue: { count: 0, value: 0 }
            } as Record<string, { count: number, value: number }>,
            timeOfDay: {
                midnight: 0,
                day: 0,
                evening: 0
            } as Record<string, number>,
            costs: {
                profit: 0,
                operatorFees: 0,
                airportFees: 0,
                fuel: 0,
                maintenance: 0
            }
        };

        jobs.forEach((job: any) => {
            const d = parseJobDate(job.bookingDate);
            if (dateFrom && (!d || d < startOfDay(dateFrom))) return;
            if (dateTo && (!d || d > endOfDay(dateTo))) return;

            stats.total++;
            const price = (typeof job.fare === 'number' ? job.fare : 0) || (typeof job.parsedPrice === 'number' ? job.parsedPrice : 0) || (typeof job.price === 'number' ? job.price : parsePrice(job.price));

            // Costs & Profit
            const opFee = job.operatorFeeAmount || (job.operatorFee ? price * (job.operatorFee / 100) : 0);
            const airportFee = job.airportFee || 0;

            // Calculate Vehicle Costs
            // Mock settings matching useSettings hook
            const SETTINGS = {
                fuelPrice: 1.50,
                fuelEfficiency: 45,
                maintenanceCost: 0.15
            };
            const LITRE_PER_GALLON = 4.546;

            let dist = 0;
            if (job.distance) {
                // Parse distance "50 mi" -> 50
                dist = parseFloat(job.distance.toString().replace(/[^\d.]/g, '')) || 0;
            }

            const fuelPricePerGallon = SETTINGS.fuelPrice * LITRE_PER_GALLON;
            const fuelCost = dist > 0 ? (dist / SETTINGS.fuelEfficiency) * fuelPricePerGallon : 0;
            const maintenanceCost = dist * SETTINGS.maintenanceCost;

            // Use stored profit if available, otherwise calculate
            const profit = job.profit || (price - opFee - airportFee - fuelCost - maintenanceCost);

            stats.costs.profit += profit;
            stats.costs.operatorFees += opFee;
            stats.costs.airportFees += airportFee;
            stats.costs.fuel += fuelCost;
            stats.costs.maintenance += maintenanceCost;

            // Status counts
            const status = job.status || 'unknown';
            if (!stats.status[status]) {
                stats.status[status] = { count: 0, value: 0 };
            }
            stats.status[status].count++;
            stats.status[status].value += price;

            // Payment Status
            const payment = job.paymentStatus || 'unpaid';
            if (!stats.payment[payment]) {
                stats.payment[payment] = { count: 0, value: 0 };
            }
            stats.payment[payment].count++;
            stats.payment[payment].value += price;

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
