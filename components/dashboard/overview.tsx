"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
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
                            <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
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
                                <Tooltip
                                    cursor={{ fill: 'transparent', opacity: 0.1 }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-popover p-3 shadow-lg ring-1 ring-black/5">
                                                    <div className="mb-1 text-xs text-muted-foreground font-medium">
                                                        {label}
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xl font-bold text-popover-foreground">
                                                            £{Number(payload[0].value).toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                            Revenue
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="currentColor"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary"
                                    barSize={40} // Consistent bar size
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
