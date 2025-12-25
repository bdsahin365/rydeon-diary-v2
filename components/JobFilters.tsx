"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface JobFiltersProps {
    counts?: {
        all: number;
        scheduled: number;
        completed: number;
        cancelled: number;
        archived: number;
    };
}

export function JobFilters({ counts }: JobFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get("filter") || "all";

    const handleFilterChange = (filter: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (filter === "all") {
            params.delete("filter");
        } else {
            params.set("filter", filter);
        }
        router.push(`/my-jobs?${params.toString()}`);
    };

    const tabs = [
        { name: 'All', value: 'all', count: counts?.all || 0 },
        { name: 'Scheduled', value: 'scheduled', count: counts?.scheduled || 0 },
        { name: 'Completed', value: 'completed', count: counts?.completed || 0 },
        { name: 'Cancelled', value: 'cancelled', count: counts?.cancelled || 0 },
        { name: 'Archive', value: 'archived', count: counts?.archived || 0 },
    ];

    return (
        <div className="w-full sm:w-auto overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
            <div className="flex items-center bg-muted/40 p-1 rounded-lg min-w-max border">
                {tabs.map((tab) => {
                    const isActive = currentFilter === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => handleFilterChange(tab.value)}
                            className={cn(
                                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                isActive
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            {tab.name}

                            {/* Scheduled Badge */}
                            {tab.value === 'scheduled' && tab.count > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
                                    {tab.count}
                                </span>
                            )}

                            {/* Completed Count (displayed as plain number next to text usually, or subtle badge) */}
                            {tab.value === 'completed' && tab.count > 0 && (
                                <span className={cn(
                                    "ml-0.5 text-xs font-semibold",
                                    isActive ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {tab.count}
                                </span>
                            )}

                            {/* Other counts if needed, keeping it clean for others unless they have significant counts */}
                            {['cancelled', 'archived'].includes(tab.value) && tab.count > 0 && (
                                <span className="ml-1 text-xs opacity-70">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
