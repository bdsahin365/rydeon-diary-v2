"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, Car, Activity, TrendingUp } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

interface StatsCardsProps {
    data: {
        revenue: { value: number; trend: number };
        profit: { value: number };
        jobs: { value: number };
        distance: { value: number; unit: string };
        efficiency: { value: number; unit: string };
    };
}

export function StatsCards({ data }: StatsCardsProps) {
    const cards = [
        {
            title: "Total Revenue",
            value: formatPrice(data.revenue.value),
            icon: DollarSign,
            description: "+20.1% from last month",
            trendColor: "text-muted-foreground"
        },
        {
            title: "Net Profit",
            value: formatPrice(data.profit.value),
            icon: Wallet,
            description: "After fees & expenses",
            trendColor: "text-muted-foreground"
        },
        {
            title: "Completed Jobs",
            value: data.jobs.value.toString(), // Ensure string
            icon: Car,
            description: "All time",
            trendColor: "text-muted-foreground"
        },
        {
            title: "Hourly Efficiency",
            value: formatPrice(data.efficiency.value),
            unit: "/hr",
            icon: Activity,
            description: "Avg. earnings per hour",
            trendColor: "text-blue-500"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {card.title}
                        </CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className={cn("text-xs", card.trendColor)}>
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
