"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
    onExpandChange?: (expanded: boolean) => void;
    externalExpanded?: boolean;
}


export function SearchFilter({ onExpandChange, externalExpanded, fullWidthMobile }: SearchFilterProps & { fullWidthMobile?: boolean } = {}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = React.useState(searchParams.get("search") || "");
    const [internalExpanded, setInternalExpanded] = React.useState(false);

    // Derived state for expanded
    const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;

    const handleExpandChange = (newState: boolean) => {
        setInternalExpanded(newState);
        onExpandChange?.(newState);
    };

    const inputRef = React.useRef<HTMLInputElement>(null);

    // Initialize expanded state if there's a value
    React.useEffect(() => {
        if (value) {
            handleExpandChange(true);
        }
    }, [value]);

    // Handle debounced search
    React.useEffect(() => {
        const handler = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            const currentSearch = params.get("search") || "";

            // Only update if value is different from current URL param
            if (value !== currentSearch) {
                if (value) {
                    params.set("search", value);
                } else {
                    params.delete("search");
                }
                router.push(`/my-jobs?${params.toString()}`);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [value, router, searchParams]);

    // Focus input when expanded
    React.useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const handleClear = () => {
        setValue("");
        handleExpandChange(false);
        // We let the debounce effect handle the URL update to avoid race conditions
    };

    return (
        <div className={cn(
            "flex items-center transition-all duration-300 ease-in-out",
            isExpanded ? "w-full sm:w-[250px]" : (fullWidthMobile ? "w-full sm:w-9" : "w-9")
        )}>
            {!isExpanded ? (
                <Button
                    variant="outline"
                    className={cn(
                        "shrink-0 text-muted-foreground hover:text-foreground",
                        fullWidthMobile ? "w-full justify-start px-3 sm:w-9 sm:px-0 sm:justify-center" : "h-9 w-9 p-0"
                    )}
                    onClick={() => handleExpandChange(true)}
                >
                    <Search className={cn("h-4 w-4", fullWidthMobile && "mr-2 sm:mr-0")} />
                    <span className={cn(fullWidthMobile ? "inline sm:hidden" : "sr-only")}>Search...</span>
                    {!fullWidthMobile && <span className="sr-only">Search</span>}
                </Button>
            ) : (
                <div className="relative w-full flex items-center">
                    <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        ref={inputRef}
                        type="search"
                        placeholder="Search..."
                        className="pl-9 pr-8 h-9 w-full bg-background"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={() => {
                            if (!value) handleExpandChange(false);
                        }}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 h-9 w-9 hover:bg-transparent text-muted-foreground hover:text-foreground"
                        onClick={handleClear}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear search</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
