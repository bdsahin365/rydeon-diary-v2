"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OperatorBreakdownProps {
    data: { name: string; jobs: number; revenue: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function OperatorBreakdown({ data }: OperatorBreakdownProps) {
    // We want to visualize by Revenue sharing usually
    const chartData = data.map(d => ({ name: d.name, value: d.revenue }));
    const hasData = chartData.length > 0;

    return (
        <Card className="col-span-3">
            {/* ... */}
            <Tooltip
                formatter={(value: number | undefined) => `£${(value || 0).toFixed(2)}`}
            />
            {/* ... */}
        </Card>
    );
}
