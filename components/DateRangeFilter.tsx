"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addDays, subWeeks, subMonths, startOfYear, endOfYear, subYears } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

type DateRange = {
    from: Date;
    to: Date;
};

type PresetOption = {
    label: string;
    getValue: () => DateRange | undefined;
};

const defaultPresets: PresetOption[] = [
    {
        label: "Today",
        getValue: () => {
            const today = new Date();
            return { from: today, to: today };
        },
    },
    {
        label: "Tomorrow",
        getValue: () => {
            const tomorrow = addDays(new Date(), 1);
            return { from: tomorrow, to: tomorrow };
        },
    },
    {
        label: "This Week",
        getValue: () => ({
            from: startOfWeek(new Date(), { weekStartsOn: 1 }),
            to: endOfWeek(new Date(), { weekStartsOn: 1 }),
        }),
    },
    {
        label: "Next Week",
        getValue: () => {
            const nextWeekStart = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 1);
            return {
                from: nextWeekStart,
                to: endOfWeek(nextWeekStart, { weekStartsOn: 1 }),
            };
        },
    },
    {
        label: "This Month",
        getValue: () => ({
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
        }),
    },
];

const dashboardPresets: PresetOption[] = [
    {
        label: "Today",
        getValue: () => {
            const today = new Date();
            return { from: today, to: today };
        },
    },
    {
        label: "This Week",
        getValue: () => ({
            from: startOfWeek(new Date(), { weekStartsOn: 1 }),
            to: endOfWeek(new Date(), { weekStartsOn: 1 }),
        }),
    },
    {
        label: "Last Week",
        getValue: () => {
            const lastWeekStart = subWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 1);
            return {
                from: lastWeekStart,
                to: endOfWeek(lastWeekStart, { weekStartsOn: 1 }),
            };
        },
    },
    {
        label: "This Month",
        getValue: () => ({
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
        }),
    },
    {
        label: "Last Month",
        getValue: () => {
            const lastMonthStart = subMonths(startOfMonth(new Date()), 1);
            return {
                from: lastMonthStart,
                to: endOfMonth(lastMonthStart),
            };
        },
    },
    {
        label: "This Year",
        getValue: () => ({
            from: startOfYear(new Date()),
            to: endOfYear(new Date()),
        }),
    },
    {
        label: "Last Year",
        getValue: () => {
            const lastYearStart = subYears(startOfYear(new Date()), 1);
            return {
                from: lastYearStart,
                to: endOfYear(lastYearStart),
            };
        },
    },
    {
        label: "All Time",
        getValue: () => ({
            from: new Date(0), // 1970-01-01
            to: addDays(new Date(), 365 * 100), // ~100 years in future
        }),
    },
];

interface DateRangeFilterProps {
    mobileMode?: boolean;
    className?: string;
    compact?: boolean;
    presetType?: 'default' | 'dashboard';
    initialDateFrom?: Date;
    initialDateTo?: Date;
}

export function DateRangeFilter({ mobileMode, className, compact, presetType = 'default', initialDateFrom, initialDateTo }: DateRangeFilterProps = {}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [open, setOpen] = React.useState(false);

    // Initialize state with props (defaults) if available, otherwise undefined
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
        initialDateFrom && initialDateTo ? { from: initialDateFrom, to: initialDateTo } : undefined
    );

    const activePresets = presetType === 'dashboard' ? dashboardPresets : defaultPresets;

    // Parse dates from URL on mount or update
    React.useEffect(() => {
        const fromParam = searchParams.get("dateFrom");
        const toParam = searchParams.get("dateTo");

        if (fromParam && toParam) {
            try {
                // Parse DD/MM/YYYY format
                const [fromDay, fromMonth, fromYear] = fromParam.split('/');
                const [toDay, toMonth, toYear] = toParam.split('/');

                setDateRange({
                    from: new Date(parseInt(fromYear), parseInt(fromMonth) - 1, parseInt(fromDay)),
                    to: new Date(parseInt(toYear), parseInt(toMonth) - 1, parseInt(toDay)),
                });
            } catch (e) {
                console.error("Error parsing date params:", e);
            }
        } else if (!fromParam && !toParam) {
            // Revert to default if params are cleared
            if (initialDateFrom && initialDateTo) {
                setDateRange({ from: initialDateFrom, to: initialDateTo });
            } else {
                setDateRange(undefined);
            }
        }
    }, [searchParams, initialDateFrom, initialDateTo]);

    const handlePresetClick = (preset: PresetOption) => {
        const range = preset.getValue();
        if (!range) {
            clearFilter();
            return;
        }
        setDateRange(range);
        updateURL(range);
        setOpen(false);
    };

    const handleCustomDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
        if (range?.from && range?.to) {
            const newRange = { from: range.from, to: range.to };
            setDateRange(newRange);
            updateURL(newRange);
        }
    };

    const updateURL = (range: DateRange) => {
        const params = new URLSearchParams(searchParams.toString());

        // Format as DD/MM/YYYY
        const fromStr = format(range.from, 'dd/MM/yyyy');
        const toStr = format(range.to, 'dd/MM/yyyy');

        params.set("dateFrom", fromStr);
        params.set("dateTo", toStr);

        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilter = () => {
        setDateRange(undefined);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("dateFrom");
        params.delete("dateTo");
        router.push(`${pathname}?${params.toString()}`);
        setOpen(false);
    };

    const [mounted, setMounted] = React.useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const getButtonLabel = () => {
        if (!mounted) return "Select Date Range";
        if (!dateRange) return "Select Date Range";

        // Check if it matches a preset
        for (const preset of activePresets) {
            const presetRange = preset.getValue();
            if (
                presetRange &&
                format(dateRange.from, 'yyyy-MM-dd') === format(presetRange.from, 'yyyy-MM-dd') &&
                format(dateRange.to, 'yyyy-MM-dd') === format(presetRange.to, 'yyyy-MM-dd')
            ) {
                return preset.label;
            }
        }

        // Custom range
        if (format(dateRange.from, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')) {
            return format(dateRange.from, 'dd MMM yyyy');
        }

        return `${format(dateRange.from, 'dd MMM')} - ${format(dateRange.to, 'dd MMM yyyy')}`;
    };

    if (!mounted) {
        return (
            <Button
                variant="outline"
                className={cn(
                    "justify-between text-muted-foreground font-normal",
                    mobileMode ? "w-full" : "w-[240px]",
                )}
            >
                {getButtonLabel()}
                <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
        );
    }



    const FilterContent = ({ isMobileView = false }: { isMobileView?: boolean }) => (
        <div className={cn("flex flex-col", !isMobileView && "sm:flex-row")}>
            {/* Presets */}
            <div className={cn("flex flex-col gap-1 p-3", !isMobileView && "border-b sm:border-b-0 sm:border-r")}>
                {!isMobileView && (
                    <div className="text-xs font-semibold text-muted-foreground mb-1 px-2">
                        Quick Select
                    </div>
                )}
                {isMobileView && <p className="text-sm font-medium mb-2 text-muted-foreground px-1">Quick Select</p>}

                <div className={cn("grid gap-2", isMobileView ? "grid-cols-2" : "flex flex-col")}>
                    {activePresets.map((preset) => (
                        <Button
                            key={preset.label}
                            variant="outline"
                            size={isMobileView ? "default" : "sm"}
                            className={cn(
                                "justify-start font-normal",
                                isMobileView && "h-10 justify-center"
                            )}
                            onClick={() => handlePresetClick(preset)}
                        >
                            {preset.label}
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        size={isMobileView ? "default" : "sm"}
                        className={cn(
                            "justify-start font-normal text-muted-foreground",
                            isMobileView && "h-10 justify-center col-span-2"
                        )}
                        onClick={clearFilter}
                    >
                        Clear Filter
                    </Button>
                </div>
            </div>

            {/* Calendar */}
            <div className="p-3 flex justify-center flex-col items-center">
                {isMobileView && <p className="text-sm font-medium mb-2 text-muted-foreground self-start w-full px-1">Custom Range</p>}
                <Calendar
                    mode="range"
                    selected={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
                    onSelect={handleCustomDateSelect}
                    numberOfMonths={1}
                    initialFocus
                />
            </div>
        </div>
    );

    if (!mounted) {
        return (
            <Button
                variant="outline"
                size={compact ? "icon" : "default"}
                className={cn(
                    "justify-between text-muted-foreground font-normal",
                    mobileMode ? "w-full" : (compact ? "w-9 px-0" : "w-[240px]"),
                    className
                )}
            >
                {!compact && getButtonLabel()}
                <CalendarIcon className={cn("h-4 w-4", !compact && "ml-2")} />
            </Button>
        );
    }

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button
                        variant="outline"
                        size={compact ? "icon" : "default"}
                        className={cn(
                            "justify-between text-muted-foreground font-normal sm:w-[240px]",
                            dateRange && "text-foreground",
                            compact ? "w-9 px-0 justify-center" : "w-full",
                            className
                        )}
                    >
                        {!compact && getButtonLabel()}
                        <CalendarIcon className={cn("h-4 w-4", !compact && "ml-2")} />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[90vh] flex flex-col fixed bottom-0 left-0 right-0">
                    <DrawerHeader className="text-left flex-none">
                        <DrawerTitle>Select Date Range</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 pt-0 flex-1 overflow-y-auto">
                        <FilterContent isMobileView={true} />
                    </div>
                    <div className="p-4 pt-2 border-t mt-auto flex-none bg-background pb-8 md:pb-4">
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-full">Cancel</Button>
                        </DrawerClose>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size={compact ? "icon" : "default"}
                    className={cn(
                        "justify-between text-muted-foreground font-normal",
                        compact ? "w-9 px-0 justify-center" : "w-[240px]",
                        dateRange && "text-foreground",
                        className
                    )}
                >
                    {!compact && getButtonLabel()}
                    <CalendarIcon className={cn("h-4 w-4", !compact && "ml-2")} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <FilterContent isMobileView={false} />
            </PopoverContent>
        </Popover>
    );
}
