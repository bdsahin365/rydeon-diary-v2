"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/SearchFilter";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function JobHeaderActions() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [searchExpanded, setSearchExpanded] = React.useState(false);

    // If mobile and search is expanded, we compact the date filter
    const compactDate = isMobile && searchExpanded;

    return (
        <div className="flex w-full sm:w-auto items-center gap-2">
            {/* Export Button - Icon only on mobile, text on desktop */}
            <Button variant="outline" size="icon" className="flex sm:hidden shrink-0 text-muted-foreground bg-card hover:bg-muted">
                <Download className="h-4 w-4" />
                <span className="sr-only">Export</span>
            </Button>
            <Button variant="outline" className="hidden sm:flex text-muted-foreground bg-card hover:bg-muted">
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>

            <div className="flex flex-1 sm:flex-none items-center gap-2 min-w-0 transition-all duration-300">
                <SearchFilter
                    onExpandChange={setSearchExpanded}
                    externalExpanded={searchExpanded}
                />
                <DateRangeFilter
                    className={cn(
                        "sm:w-[240px] min-w-0 transition-all duration-300",
                        !compactDate && "flex-1"
                    )}
                    compact={compactDate}
                />
            </div>
        </div>
    );
}
