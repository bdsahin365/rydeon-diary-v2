'use client';

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getJobUsage } from "@/actions/job-usage";
import Link from "next/link";
import { Zap } from "lucide-react";

export function JobUsageIndicator() {
    const [usage, setUsage] = useState<{ count: number; limit: number; plan: string } | null>(null);

    useEffect(() => {
        getJobUsage().then(setUsage);
    }, []);

    if (!usage || usage.plan === 'pro') return null;

    const percentage = Math.min((usage.count / usage.limit) * 100, 100);

    return (
        <div className="mx-4 mb-4 p-4 rounded-lg bg-muted/50 border space-y-3">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Free Plan</span>
                <span className="text-muted-foreground">{usage.count} / {usage.limit} jobs</span>
            </div>
            <Progress value={percentage} className="h-2" />

            {percentage >= 80 && (
                <p className="text-xs text-amber-600 font-medium">
                    {percentage >= 100 ? "Limit reached!" : "Approaching limit"}
                </p>
            )}

            <Button size="sm" className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0" asChild>
                <Link href="/pro">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Upgrade to Pro
                </Link>
            </Button>
        </div>
    );
}
