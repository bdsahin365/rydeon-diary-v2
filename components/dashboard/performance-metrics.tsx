"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, Car, Activity, CheckCircle, XCircle } from "lucide-react";

interface PerformanceMetricsProps {
    stats: {
        revenue: { value: number; trend: number };
        profit: { value: number };
        jobs: { value: number };
        distance: { value: number; unit: string };
        efficiency: { value: number; unit: string };
    };
    vehicleStats: { name: string; jobs: number; revenue: number }[];
    statusCounts?: Record<string, { count: number; value: number }>;
    paymentCounts?: Record<string, { count: number; value: number }>;
}

export function PerformanceMetrics({ stats, vehicleStats, statusCounts, paymentCounts }: PerformanceMetricsProps) {
    const avgJobPrice = stats.jobs.value > 0 ? stats.revenue.value / stats.jobs.value : 0;
    const profitMargin = stats.revenue.value > 0 ? (stats.profit.value / stats.revenue.value) * 100 : 0;

    // Calculate completion rate
    let completionRate = 0;
    const completedCount = statusCounts?.completed?.count || 0;
    const cancelledCount = statusCounts?.cancelled?.count || 0;
    const totalEnded = completedCount + cancelledCount;

    if (totalEnded > 0) {
        completionRate = (completedCount / totalEnded) * 100;
    } else if (stats.jobs.value > 0) {
        completionRate = 100;
    }

    const topVehicles = vehicleStats.slice(0, 3);

    return (
        <Card className="col-span-full lg:col-span-4 h-full">
            <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                    Key indicators and detailed financial breakdown.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Top Level KPIs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Avg Job Price</p>
                            <div className="text-2xl font-bold flex items-center">
                                {formatPrice(avgJobPrice)}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                            <div className="text-2xl font-bold flex items-center text-green-500">
                                {profitMargin.toFixed(1)}%
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
                            <div className="text-2xl font-bold flex items-center">
                                {formatPrice(stats.efficiency.value)}{stats.efficiency.unit}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                            <div className="text-2xl font-bold flex items-center">
                                {completionRate.toFixed(0)}%
                            </div>
                        </div>
                    </div>

                    {/* Job Status Breakdown */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            Job Status Breakdown
                        </h4>
                        <div className="space-y-3">
                            <BreakdownRow label="Completed" data={statusCounts?.completed} />
                            <BreakdownRow label="Scheduled" data={statusCounts?.scheduled} />
                            <BreakdownRow label="Cancelled" data={statusCounts?.cancelled} />
                        </div>
                    </div>

                    {/* Payment Status Breakdown */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            Payment Status Breakdown
                        </h4>
                        <div className="space-y-3">
                            <BreakdownRow label="Paid" data={paymentCounts?.paid} color="text-green-600" />
                            <BreakdownRow label="Unpaid" data={paymentCounts?.unpaid} color="text-amber-600" />
                            <BreakdownRow label="Overdue" data={paymentCounts?.overdue} color="text-red-600" />
                        </div>
                    </div>

                    {/* Top Vehicles */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            Top Performing Vehicles
                        </h4>
                        <div className="space-y-4">
                            {topVehicles.length > 0 ? topVehicles.map((v, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium">{v.name}</p>
                                            <p className="text-xs text-muted-foreground">{v.jobs} jobs</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold">
                                        {formatPrice(v.revenue)}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No vehicle data yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function BreakdownRow({ label, data, color }: { label: string, data?: { count: number, value: number }, color?: string }) {
    if (!data) return null;
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label} ({data.count})</span>
            <span className={`font-medium ${color || ''}`}>{formatPrice(data.value)}</span>
        </div>
    )
}
