"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns"; // Client side format if needed, but we pass strings or handle it

interface RecentJobsProps {
    jobs: any[]; // define proper type if available
}

export function RecentJobs({ jobs }: RecentJobsProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Your last {jobs.length} completed jobs.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {jobs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent jobs found.</p>
                    ) : (
                        jobs.map((job) => (
                            <div key={job._id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{job.customerName?.substring(0, 2).toUpperCase() || 'UN'}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{job.customerName || 'Unknown Customer'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {job.pickup && typeof job.pickup === 'string' ? job.pickup.split(',')[0] : 'Unknown'} → {job.dropoff && typeof job.dropoff === 'string' ? job.dropoff.split(',')[0] : 'Unknown'}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-green-600">
                                    +£{typeof job.price === 'number' ? job.price.toFixed(2) : job.price}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
