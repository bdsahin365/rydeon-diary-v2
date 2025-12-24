"use client";

import * as React from "react";
import { ChevronDown, Moon, Sun, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { TimeOfDay } from "@/lib/time-utils";

const timeOfDayOptions: { value: TimeOfDay; label: string; icon: React.ElementType }[] = [
    { value: 'midnight', label: 'Midnight (12AM-6AM)', icon: Moon },
    { value: 'day', label: 'Day (6AM-6PM)', icon: Sun },
    { value: 'evening', label: 'Evening (6PM-12AM)', icon: Sunset },
];

export function TimeOfDayFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = React.useState(false);

    // Parse selected times from URL
    const selectedTimes = React.useMemo(() => {
        const param = searchParams.get("timeOfDay");
        if (!param) return [];
        return param.split(',').filter((t): t is TimeOfDay =>
            timeOfDayOptions.some(tod => tod.value === t)
        );
    }, [searchParams]);

    const handleToggle = (time: TimeOfDay) => {
        const params = new URLSearchParams(searchParams.toString());

        let newSelected: TimeOfDay[];
        if (selectedTimes.includes(time)) {
            // Remove time
            newSelected = selectedTimes.filter(t => t !== time);
        } else {
            // Add time
            newSelected = [...selectedTimes, time];
        }

        if (newSelected.length === 0) {
            params.delete("timeOfDay");
        } else {
            params.set("timeOfDay", newSelected.join(','));
        }

        router.push(`/my-jobs?${params.toString()}`);
    };

    const clearAll = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("timeOfDay");
        router.push(`/my-jobs?${params.toString()}`);
        setOpen(false);
    };

    const getButtonLabel = () => {
        if (selectedTimes.length === 0) return "All Times";
        if (selectedTimes.length === 1) {
            const time = timeOfDayOptions.find(tod => tod.value === selectedTimes[0]);
            return time?.label.split(' ')[0] || "Time of Day";
        }
        return `${selectedTimes.length} Times`;
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full sm:w-auto justify-between text-muted-foreground font-normal",
                        selectedTimes.length > 0 && "text-foreground"
                    )}
                >
                    {getButtonLabel()}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {timeOfDayOptions.map((time) => {
                    const Icon = time.icon;
                    return (
                        <DropdownMenuCheckboxItem
                            key={time.value}
                            checked={selectedTimes.includes(time.value)}
                            onCheckedChange={() => handleToggle(time.value)}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {time.label}
                        </DropdownMenuCheckboxItem>
                    );
                })}
                {selectedTimes.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={false}
                            onCheckedChange={clearAll}
                            className="text-muted-foreground"
                        >
                            Clear All
                        </DropdownMenuCheckboxItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
