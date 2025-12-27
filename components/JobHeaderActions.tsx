"use client";

import * as React from "react";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/SearchFilter";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { ExportJobsDialog } from "@/components/ExportJobsDialog";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function JobHeaderActions() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [searchExpanded, setSearchExpanded] = React.useState(false);
    const router = useRouter();

    // On mobile, the date filter is always compact (icon only) to save space
    const compactDate = isMobile;

    return (
        <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="flex flex-1 sm:flex-none items-center gap-2 min-w-0 transition-all duration-300">
                <SearchFilter
                    onExpandChange={setSearchExpanded}
                    externalExpanded={searchExpanded}
                    fullWidthMobile
                />
                <DateRangeFilter
                    className={cn(
                        "sm:w-[240px] min-w-0 transition-all duration-300",
                        !compactDate && "flex-1"
                    )}
                    compact={compactDate}
                />
            </div>

            <ExportJobsDialog />



            {/* Refresh Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => router.refresh()}
                className="shrink-0 text-muted-foreground bg-card hover:bg-muted"
            >
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
            </Button>
        </div>
    );
}
