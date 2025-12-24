import { Button } from "@/components/ui/button";
import {
    Download,
} from "lucide-react";
import { JobCard, Job } from "@/components/JobCard";
import { getJobs } from "@/app/actions/jobActions";
import { JobFilters } from "@/components/JobFilters";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { PaymentStatusFilter } from "@/components/PaymentStatusFilter";
import { TimeOfDayFilter } from "@/components/TimeOfDayFilter";

export default async function MyJobsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const filter = typeof resolvedSearchParams.filter === 'string' ? resolvedSearchParams.filter : undefined;
    const dateFrom = typeof resolvedSearchParams.dateFrom === 'string' ? resolvedSearchParams.dateFrom : undefined;
    const dateTo = typeof resolvedSearchParams.dateTo === 'string' ? resolvedSearchParams.dateTo : undefined;
    const paymentStatus = typeof resolvedSearchParams.paymentStatus === 'string' ? resolvedSearchParams.paymentStatus : undefined;
    const timeOfDay = typeof resolvedSearchParams.timeOfDay === 'string' ? resolvedSearchParams.timeOfDay : undefined;
    const jobs = await getJobs(filter, dateFrom, dateTo, paymentStatus, timeOfDay);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
                    <p className="text-sm text-muted-foreground">Your driving summary for this month</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-muted-foreground bg-card hover:bg-muted">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <DateRangeFilter />
                </div>
            </div>

            {/* Tabs and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
                <JobFilters />

                <div className="flex flex-row items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    {/* Filters Row - Scrollable on very small screens, single line */}
                    <div className="flex flex-1 gap-2 min-w-0 sm:justify-end">
                        <div className="flex-1 sm:flex-none min-w-[140px] max-w-[200px] sm:w-[160px]">
                            <PaymentStatusFilter />
                        </div>
                        <div className="flex-1 sm:flex-none min-w-[130px] max-w-[200px] sm:w-[160px]">
                            <TimeOfDayFilter />
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {jobs.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No jobs found. Click "Seed Data" to populate.
                    </div>
                ) : (
                    jobs.map((job: Job) => (
                        <JobCard key={job._id || job.id} job={job} />
                    ))
                )}
            </div>
        </div>
    );
}
