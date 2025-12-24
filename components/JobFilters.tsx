"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function JobFilters() {
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
        { name: 'All Jobs', value: 'all', count: 0 },
        { name: 'Upcoming', value: 'scheduled', count: 0 },
        { name: 'Completed', value: 'completed', count: 0 },
        { name: 'Cancelled', value: 'cancelled', count: 0 },
        { name: 'Archive', value: 'archived', count: 0 },
    ];

    return (
        <div className="w-full sm:w-auto overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
            <div className="flex gap-2 sm:gap-1 min-w-max">
                {tabs.map((tab) => (
                    <Button
                        key={tab.value}
                        variant="ghost"
                        onClick={() => handleFilterChange(tab.value)}
                        className={cn(
                            "rounded-full px-4 font-medium transition-all text-sm h-9 border",
                            currentFilter === tab.value
                                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground shadow-sm"
                                : "bg-background text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {tab.name}
                    </Button>
                ))}
            </div>
        </div>
    );
}
