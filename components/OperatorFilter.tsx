"use client";

import * as React from "react";
import { ChevronDown, Check, User, Users } from "lucide-react";
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

interface OperatorFilterProps {
    operators: string[];
    fullWidth?: boolean;
}

export function OperatorFilter({ operators, fullWidth }: OperatorFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = React.useState(false);

    // Get selected operator from URL
    const selectedOperator = searchParams.get("operator");

    const handleSelect = (operator: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("operator", operator);
        router.push(`/my-jobs?${params.toString()}`);
        setOpen(false);
    };

    const clearFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("operator");
        router.push(`/my-jobs?${params.toString()}`);
        setOpen(false);
    };

    const getButtonLabel = () => {
        if (!selectedOperator) return "All Operators";
        return selectedOperator;
    };

    const isMobile = useMediaQuery("(max-width: 768px)");

    const FilterContent = ({ isMobileView = false }: { isMobileView?: boolean }) => {
        if (isMobileView) {
            return (
                <div className="flex flex-col gap-3">
                    <div className="text-sm font-medium text-muted-foreground px-1">
                        Filter by Operator
                    </div>
                    {operators.length === 0 ? (
                        <div className="p-4 Text-sm text-center text-muted-foreground bg-muted/20 rounded-md">
                            No operators found
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                            {operators.map((operator) => (
                                <Button
                                    key={operator}
                                    variant={selectedOperator === operator ? "default" : "outline"}
                                    className={cn("justify-start h-12 relative overflow-hidden", selectedOperator === operator && "border-primary")}
                                    onClick={() => handleSelect(operator)}
                                >
                                    <User className={cn("mr-2 h-4 w-4", selectedOperator === operator ? "text-primary-foreground" : "text-muted-foreground")} />
                                    <span className="truncate">{operator}</span>
                                    {selectedOperator === operator && (
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary-foreground/20" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    )}
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
                    Filter by Operator
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {operators.length === 0 ? (
                        <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                            No operators found
                        </div>
                    ) : (
                        operators.map((operator) => (
                            <div
                                key={operator}
                                className={cn(
                                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                    selectedOperator === operator ? "bg-accent/50" : ""
                                )}
                                onClick={() => handleSelect(operator)}
                            >
                                <span className="flex-1 truncate">{operator}</span>
                                {selectedOperator === operator && (
                                    <span className="flex h-3.5 w-3.5 items-center justify-center absolute right-2">
                                        <Check className="h-4 w-4 rotate-0" />
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
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
                            fullWidth ? "w-full" : "w-[140px]",
                            selectedOperator && "text-foreground bg-accent/50 border-accent-foreground/50",
                        )}
                    >
                        <span className="truncate mr-2 max-w-[100px]">
                            {getButtonLabel()}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[90vh] flex flex-col fixed bottom-0 left-0 right-0">
                    <DrawerHeader className="flex-none">
                        <DrawerTitle>Select Operator</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 pb-0 flex-1 overflow-y-auto">
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
        <DropdownMenu open={open} onOpenChange={setOpen} modal={!fullWidth}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "justify-between text-muted-foreground font-normal px-3 h-9",
                        fullWidth ? "w-full" : "w-[140px]",
                        selectedOperator && "text-foreground bg-accent/50 border-accent-foreground/50",
                    )}
                >
                    <span className="truncate mr-2 max-w-[100px]">
                        {getButtonLabel()}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Operator</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {operators.map((operator) => (
                        <DropdownMenuItem
                            key={operator}
                            onClick={() => handleSelect(operator)}
                            className={cn(
                                selectedOperator === operator && "bg-accent"
                            )}
                        >
                            {operator}
                        </DropdownMenuItem>
                    ))}
                </div>
                {selectedOperator && (
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
