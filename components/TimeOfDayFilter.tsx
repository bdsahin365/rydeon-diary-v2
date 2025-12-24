"use client";

import * as React from "react";
import { ChevronDown, Moon, Sun, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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

    // Get selected time from URL
    const selectedTime = searchParams.get("timeOfDay") as TimeOfDay | null;

    const handleSelect = (time: TimeOfDay) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("timeOfDay", time);
        router.push(`/my-jobs?${params.toString()}`);
        setOpen(false);
    };

    const clearFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("timeOfDay");
        router.push(`/my-jobs?${params.toString()}`);
        setOpen(false);
    };

    const getButtonLabel = () => {
        if (!selectedTime) return "All Times";
        const time = timeOfDayOptions.find(tod => tod.value === selectedTime);
        return time?.label.split(' ')[0] || "Time of Day";
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full sm:w-auto justify-between text-muted-foreground font-normal",
                        selectedTime && "text-foreground"
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
                        <DropdownMenuItem
                            key={time.value}
                            onClick={() => handleSelect(time.value)}
                            className={cn(
                                selectedTime === time.value && "bg-accent"
                            )}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {time.label}
                        </DropdownMenuItem>
                    );
                })}
                {selectedTime && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={clearFilter}
                            className="text-muted-foreground"
                        >
                            Clear Filter
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
