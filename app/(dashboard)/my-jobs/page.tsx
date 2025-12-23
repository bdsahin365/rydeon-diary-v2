import { Button } from "@/components/ui/button";
import {
    Download,
    Calendar as CalendarIcon,
    ChevronDown,
} from "lucide-react";
import { JobCard, Job } from "@/components/JobCard";
import { getJobs } from "@/app/actions/jobActions";
import { JobFilters } from "@/components/JobFilters";

export default async function MyJobsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const filter = typeof resolvedSearchParams.filter === 'string' ? resolvedSearchParams.filter : undefined;
    const jobs = await getJobs(filter);

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
                    <Button variant="outline" className="text-muted-foreground bg-card hover:bg-muted">
                        This Month
                        <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Tabs and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-1">
                <JobFilters />

                <div className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto justify-between text-muted-foreground font-normal">
                        All Payment Statuses
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
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
