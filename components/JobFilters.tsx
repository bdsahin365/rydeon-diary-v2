"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

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

    return (
        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <Button
                variant="ghost"
                onClick={() => handleFilterChange("all")}
                className={`rounded-none border-b-2 px-4 font-medium hover:bg-transparent ${currentFilter === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
                All Jobs
            </Button>
            <Button
                variant="ghost"
                onClick={() => handleFilterChange("scheduled")}
                className={`rounded-none border-b-2 px-4 font-medium hover:bg-transparent ${currentFilter === 'scheduled' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
                Upcoming
            </Button>
            <Button
                variant="ghost"
                onClick={() => handleFilterChange("completed")}
                className={`rounded-none border-b-2 px-4 font-medium hover:bg-transparent ${currentFilter === 'completed' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
                Completed
            </Button>
            <Button
                variant="ghost"
                onClick={() => handleFilterChange("cancelled")}
                className={`rounded-none border-b-2 px-4 font-medium hover:bg-transparent ${currentFilter === 'cancelled' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
                Cancelled
            </Button>
            <Button
                variant="ghost"
                className="rounded-none border-b-2 border-transparent text-muted-foreground font-medium px-4 hover:bg-transparent hover:text-foreground"
            >
                Advanced
            </Button>
        </div>
    );
}
