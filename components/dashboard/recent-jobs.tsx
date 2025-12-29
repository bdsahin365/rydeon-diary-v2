"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RecentJobsProps {
    jobs: any[];
}

export function RecentJobs({ jobs }: RecentJobsProps) {
    return (
        <Card className="col-span-full lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    You completed {jobs.length} jobs this month.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {jobs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent jobs found.</p>
                    ) : (
                        jobs.map((job) => {
                            // Robust price calculation
                            const priceValue = (typeof job.fare === 'number' ? job.fare : 0) ||
                                (typeof job.parsedPrice === 'number' ? job.parsedPrice : 0) ||
                                (typeof job.price === 'number' ? job.price :
                                    (job.price ? parseFloat(job.price.toString().replace(/[^\d.]/g, '')) || 0 : 0));

                            return (
                                <div key={job._id} className="flex items-center">
                                    <Avatar className="h-9 w-9 shrink-0">
                                        <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                        <AvatarFallback>{job.customerName?.substring(0, 2).toUpperCase() || 'UN'}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1 flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-none truncate">{job.customerName || 'Unknown Customer'}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {job.vehicle || 'Standard Job'}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium shrink-0">
                                        +£{priceValue.toFixed(2)}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
