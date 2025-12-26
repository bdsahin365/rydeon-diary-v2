import { Button } from "@/components/ui/button";
import { Download, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { JobCard, Job } from "@/components/JobCard";
import { JobHeaderActions } from "@/components/JobHeaderActions";
import { OperatorFilter } from "@/components/OperatorFilter";
import { getJobs, getJobCounts, getUniqueOperators } from "@/app/actions/jobActions";
import { JobFilters } from "@/components/JobFilters";
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
    const searchQuery = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
    const operator = typeof resolvedSearchParams.operator === 'string' ? resolvedSearchParams.operator : undefined;

    const jobs = await getJobs(filter, dateFrom, dateTo, paymentStatus, timeOfDay, searchQuery, operator);
    const jobCounts = await getJobCounts();
    const uniqueOperators = await getUniqueOperators();

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
                    <p className="text-sm text-muted-foreground">Your driving summary for this month</p>
                </div>
                <JobHeaderActions />
            </div>

            {/* Tabs and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
                <JobFilters counts={jobCounts} />

                <div className="flex flex-row items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    {/* Filters Row - Scrollable on very small screens, single line */}
                    <div className="flex flex-1 gap-2 min-w-0 sm:justify-end">
                        <div className="flex-1 sm:flex-none min-w-[140px] max-w-[200px] sm:w-[160px]">
                            <OperatorFilter operators={uniqueOperators} fullWidth />
                        </div>
                        <div className="flex-1 sm:flex-none min-w-[140px] max-w-[200px] sm:w-[160px]">
                            <PaymentStatusFilter fullWidth />
                        </div>
                        <div className="flex-1 sm:flex-none min-w-[130px] max-w-[200px] sm:w-[160px]">
                            <TimeOfDayFilter fullWidth />
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {jobs.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/10">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <ClipboardList className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No jobs found</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            There are no jobs to display. Try adjusting your filters or add a new job to get started.
                        </p>
                        <Button asChild>
                            <Link href="/add-job">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Job
                            </Link>
                        </Button>
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
