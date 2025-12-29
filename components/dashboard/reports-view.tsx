"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";
import { OperatorBreakdown } from "@/components/dashboard/operator-breakdown";

interface ReportsViewProps {
    stats: {
        total: number;
        status: Record<string, { count: number, value: number }>;
        payment: Record<string, { count: number, value: number }>;
        timeOfDay: Record<string, number>;
        costs: {
            profit: number;
            operatorFees: number;
            airportFees: number;
            fuel: number;
            maintenance: number;
        };
    } | null;
    operatorData: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff0000'];
const PAYMENT_COLORS = {
    paid: '#22c55e',   // green-500
    unpaid: '#f59e0b', // amber-500
    overdue: '#ef4444' // red-500
} as const;

const COST_COLORS = {
    'Net Profit': '#22c55e',    // green
    'Operator Fees': '#f97316', // orange
    'Airport Fees': '#ef4444',  // red
    'Fuel Cost': '#eab308',     // yellow-500
    'Maintenance': '#64748b'    // slate-500
} as const;

export function ReportsView({ stats, operatorData }: ReportsViewProps) {
    if (!stats) return <div className="p-4">No report data available.</div>;

    // Transform data for charts
    const statusData = Object.entries(stats.status).map(([name, data]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: data.count }));
    const paymentData = Object.entries(stats.payment).map(([name, data]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: data.count }));
    const timeData = [
        { name: 'Midnight (12AM-6AM)', value: stats.timeOfDay.midnight || 0 },
        { name: 'Day (6AM-6PM)', value: stats.timeOfDay.day || 0 },
        { name: 'Evening (6PM-12AM)', value: stats.timeOfDay.evening || 0 }
    ];

    const costs = stats.costs || { profit: 0, operatorFees: 0, airportFees: 0, fuel: 0, maintenance: 0 };
    const costData = [
        { name: 'Net Profit', value: costs.profit },
        { name: 'Operator Fees', value: costs.operatorFees },
        { name: 'Airport Fees', value: costs.airportFees },
        { name: 'Fuel Cost', value: costs.fuel },
        { name: 'Maintenance', value: costs.maintenance }
    ].filter(item => item.value > 0);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Status Breakdown - Pie Chart */}
                <Card className="col-span-1 lg:col-span-3">
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

                {/* Revenue Distribution - Pie Chart */}
                <Card className="col-span-1 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Breakdown</CardTitle>
                        <CardDescription>Distribution of revenue into profit and fees.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {costData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={costData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `£${value}`}
                                        />
                                        <RechartsTooltip
                                            cursor={{ fill: 'transparent' }}
                                            formatter={(value: any) => [`£${Number(value).toFixed(2)}`, 'Amount']}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                                            {costData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COST_COLORS[entry.name as keyof typeof COST_COLORS]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    No value data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Payment Status - Donut/Pie */}
                <Card className="col-span-full lg:col-span-3">
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
            </div>

            <OperatorBreakdown data={operatorData} />
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
