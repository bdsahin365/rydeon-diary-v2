"use client";

import * as React from "react";
import { ChevronDown, Moon, Sun, Sunset, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { TimeOfDay } from "@/lib/time-utils";

const timeOfDayOptions: { value: TimeOfDay; label: string; icon: React.ElementType }[] = [
    { value: 'midnight', label: 'Midnight (12AM-6AM)', icon: Moon },
    { value: 'day', label: 'Day (6AM-6PM)', icon: Sun },
    { value: 'evening', label: 'Evening (6PM-12AM)', icon: Sunset },
];

interface TimeOfDayFilterProps {
    fullWidth?: boolean;
}

export function TimeOfDayFilter({ fullWidth }: TimeOfDayFilterProps = {}) {
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

    const isMobile = useMediaQuery("(max-width: 768px)");

    const FilterContent = ({ isMobileView = false }: { isMobileView?: boolean }) => {
        if (isMobileView) {
            return (
                <div className="flex flex-col gap-3">
                    <div className="text-sm font-medium text-muted-foreground px-1">
                        Filter by Time
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {timeOfDayOptions.map((option) => (
                            <Button
                                key={option.value}
                                variant={selectedTime === option.value ? "default" : "outline"}
                                className={cn("justify-start h-12 relative overflow-hidden", selectedTime === option.value && "border-primary")}
                                onClick={() => handleSelect(option.value)}
                            >
                                <option.icon className={cn("mr-2 h-4 w-4", selectedTime === option.value ? "text-primary-foreground" : "text-muted-foreground")} />
                                <span>{option.label}</span>
                                {selectedTime === option.value && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary-foreground/20" />
                                )}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full h-12 text-muted-foreground mt-2"
                        onClick={clearFilter}
                    >
                        Clear Filter
                    </Button>
                </div>
            )
        }

        return (
            <div className="p-1">
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                    Filter by Time
                </div>
                {timeOfDayOptions.map((option) => (
                    <div
                        key={option.value}
                        className={cn(
                            "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                            selectedTime === option.value ? "bg-accent/50" : ""
                        )}
                        onClick={() => handleSelect(option.value)}
                    >
                        <option.icon className="mr-2 h-4 w-4 opacity-70" />
                        <span className="flex-1">{option.label}</span>
                        {selectedTime === option.value && (
                            <span className="flex h-3.5 w-3.5 items-center justify-center">
                                <Check className="h-4 w-4 rotate-0" />
                            </span>
                        )}
                    </div>
                ))}
                <div className="h-px bg-muted my-1" />
                <div
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    onClick={clearFilter}
                >
                    Clear Filter
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "justify-between text-muted-foreground font-normal px-3 h-9",
                            fullWidth ? "w-full" : "w-[120px]",
                            selectedTime && "text-foreground bg-accent/50 border-accent-foreground/50",
                        )}
                    >
                        <span className="truncate mr-2 flex items-center gap-2">
                            {selectedTime ? (
                                <>
                                    {React.createElement(timeOfDayOptions.find(t => t.value === selectedTime)?.icon || Sun, { className: "h-3.5 w-3.5" })}
                                    {getButtonLabel()}
                                </>
                            ) : (
                                "Time"
                            )}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Select Time of Day</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        <FilterContent isMobileView={true} />
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={!fullWidth}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "justify-between text-muted-foreground font-normal px-3 h-9",
                        fullWidth ? "w-full" : "w-[120px]",
                        selectedTime && "text-foreground bg-accent/50 border-accent-foreground/50"
                    )}
                >
                    <span className="truncate mr-2 flex items-center gap-2">
                        {selectedTime ? (
                            <>
                                {React.createElement(timeOfDayOptions.find(t => t.value === selectedTime)?.icon || Sun, { className: "h-3.5 w-3.5" })}
                                {getButtonLabel()}
                            </>
                        ) : (
                            "Time"
                        )}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Time</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {timeOfDayOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                            selectedTime === option.value && "bg-accent"
                        )}
                    >
                        <div className="flex items-center">
                            <option.icon className="mr-2 h-4 w-4 opacity-70" />
                            {option.label}
                        </div>
                    </DropdownMenuItem>
                ))}
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
