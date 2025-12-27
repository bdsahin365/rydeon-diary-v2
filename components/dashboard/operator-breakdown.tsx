"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OperatorBreakdownProps {
    data: { name: string; jobs: number; revenue: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function OperatorBreakdown({ data }: OperatorBreakdownProps) {
    const chartData = data.map(d => ({ name: d.name, value: d.revenue }));
    const hasData = chartData.length > 0;

    return (
        <Card className="col-span-full lg:col-span-3">
            <CardHeader>
                <CardTitle>Operator Breakdown</CardTitle>
                <CardDescription>Revenue distribution by operator.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-4">
                    <div className="h-[200px] w-full">
                        {hasData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number | undefined) => `£${(value || 0).toFixed(2)}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No operator data available.
                            </div>
                        )}
                    </div>
                    {/* Custom Scrollable Legend */}
                    {hasData && (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {chartData.map((entry, index) => (
                                <div key={index} className="flex items-center text-sm">
                                    <div
                                        className="h-3 w-3 rounded-full mr-2 shrink-0"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <div className="font-medium truncate flex-1 min-w-0" title={entry.name}>
                                        {entry.name}
                                    </div>
                                    <div className="ml-auto text-muted-foreground shrink-0 pl-2">
                                        £{entry.value.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
