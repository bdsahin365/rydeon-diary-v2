"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface OverviewProps {
    data: { name: string; revenue: number; profit: number }[];
}

export function Overview({ data }: OverviewProps) {
    // If no data, show empty state or just render empty chart
    const hasData = data && data.length > 0 && data.some(d => d.revenue > 0);

    return (
        <Card className="col-span-full lg:col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `£${value}`}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="currentColor"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            No earnings data available for this period.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
