"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";
import { OperatorBreakdown } from "@/components/dashboard/operator-breakdown";

interface ReportsViewProps {
    stats: {
        total: number;
        status: Record<string, number>;
        payment: Record<string, number>;
        timeOfDay: Record<string, number>;
    } | null;
    operatorData: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff0000'];
const PAYMENT_COLORS = {
    paid: '#22c55e',   // green-500
    unpaid: '#f59e0b', // amber-500
    overdue: '#ef4444' // red-500
} as const;

export function ReportsView({ stats, operatorData }: ReportsViewProps) {
    if (!stats) return <div className="p-4">No report data available.</div>;

    // Transform data for charts
    const statusData = Object.entries(stats.status).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    const paymentData = Object.entries(stats.payment).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    const timeData = [
        { name: 'Midnight (12AM-6AM)', value: stats.timeOfDay.midnight || 0 },
        { name: 'Day (6AM-6PM)', value: stats.timeOfDay.day || 0 },
        { name: 'Evening (6PM-12AM)', value: stats.timeOfDay.evening || 0 }
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Status Breakdown - Pie Chart */}
                <Card className="col-span-full lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Job Status Distribution</CardTitle>
                        <CardDescription>Breakdown of all {stats.total} jobs by status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => [value, 'Jobs']} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Status - Donut/Pie */}
                <Card className="col-span-full lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Payment Status</CardTitle>
                        <CardDescription>Overview of payment collection.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentData} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} />
                                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                        {paymentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getPaymentColor(entry.name)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Time of Day - Bar Chart */}
                <Card className="col-span-full lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Time of Day Analysis</CardTitle>
                        <CardDescription>When are your jobs scheduled?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timeData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Operator Breakdown Reuse */}
                <OperatorBreakdown data={operatorData} />
            </div>
        </div>
    );
}

function getPaymentColor(status: string) {
    const s = status.toLowerCase();
    if (s === 'paid') return '#22c55e';
    if (s === 'unpaid') return '#f59e0b';
    if (s === 'overdue') return '#ef4444';
    return '#94a3b8';
}
