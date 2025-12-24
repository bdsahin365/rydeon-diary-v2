"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type DateRange = {
    from: Date;
    to: Date;
};

type PresetOption = {
    label: string;
    getValue: () => DateRange;
};

const presets: PresetOption[] = [
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

interface DateRangeFilterProps {
    mobileMode?: boolean;
}

export function DateRangeFilter({ mobileMode }: DateRangeFilterProps = {}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = React.useState(false);
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

    // Parse dates from URL on mount
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
        }
    }, [searchParams]);

    const handlePresetClick = (preset: PresetOption) => {
        const range = preset.getValue();
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

        router.push(`/my-jobs?${params.toString()}`);
    };

    const clearFilter = () => {
        setDateRange(undefined);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("dateFrom");
        params.delete("dateTo");
        router.push(`/my-jobs?${params.toString()}`);
        setOpen(false);
    };

    const getButtonLabel = () => {
        if (!dateRange) return "Select Date Range";

        // Check if it matches a preset
        for (const preset of presets) {
            const presetRange = preset.getValue();
            if (
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "justify-between text-muted-foreground font-normal",
                        mobileMode ? "w-full" : "w-[240px]",
                        dateRange && "text-foreground"
                    )}
                >
                    {getButtonLabel()}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <div className="flex">
                    {/* Presets */}
                    <div className="flex flex-col gap-1 p-3 border-r">
                        <div className="text-xs font-semibold text-muted-foreground mb-1 px-2">
                            Quick Select
                        </div>
                        {presets.map((preset) => (
                            <Button
                                key={preset.label}
                                variant="ghost"
                                size="sm"
                                className="justify-start font-normal"
                                onClick={() => handlePresetClick(preset)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                        <div className="border-t my-1" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start font-normal text-muted-foreground"
                            onClick={clearFilter}
                        >
                            Clear Filter
                        </Button>
                    </div>

                    {/* Calendar */}
                    <div className="p-3">
                        <Calendar
                            mode="range"
                            selected={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
                            onSelect={handleCustomDateSelect}
                            numberOfMonths={1}
                            initialFocus
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
