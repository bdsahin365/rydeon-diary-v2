"use client";

import * as React from "react";
import { ChevronDown, Check, Wallet, CheckCircle, Clock, XCircle } from "lucide-react";
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

type PaymentStatus = 'paid' | 'unpaid' | 'overdue' | 'scheduled';

const paymentStatuses: { value: PaymentStatus; label: string; icon: React.ElementType }[] = [
    { value: 'paid', label: 'Paid', icon: CheckCircle },
    { value: 'unpaid', label: 'Unpaid', icon: Wallet },
    { value: 'overdue', label: 'Overdue', icon: XCircle },
    { value: 'scheduled', label: 'Scheduled', icon: Clock },
];

interface PaymentStatusFilterProps {
    fullWidth?: boolean;
}

export function PaymentStatusFilter({ fullWidth }: PaymentStatusFilterProps = {}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = React.useState(false);

    // Get selected status from URL
    const selectedStatus = searchParams.get("paymentStatus") as PaymentStatus | null;

    const handleSelect = (status: PaymentStatus) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("paymentStatus", status);
        router.push(`/my-jobs?${params.toString()}`);
        setOpen(false);
    };

    const clearFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("paymentStatus");
        router.push(`/my-jobs?${params.toString()}`);
        setOpen(false);
    };

    const getButtonLabel = () => {
        if (!selectedStatus) return "All Payment Statuses";
        const status = paymentStatuses.find(ps => ps.value === selectedStatus);
        return status?.label || "Payment Status";
    };

    const isMobile = useMediaQuery("(max-width: 768px)");
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                variant="outline"
                className={cn(
                    "justify-between text-muted-foreground font-normal px-3 h-9",
                    fullWidth ? "w-full" : "w-[140px]",
                    selectedStatus && "text-foreground bg-accent/50 border-accent-foreground/50",
                )}
            >
                <span className="truncate mr-2">
                    {getButtonLabel()}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
            </Button>
        );
    }

    const FilterContent = ({ isMobileView = false }: { isMobileView?: boolean }) => {
        if (isMobileView) {
            return (
                <div className="flex flex-col gap-3">
                    <div className="text-sm font-medium text-muted-foreground px-1">
                        Filter by Status
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {paymentStatuses.map((status) => (
                            <Button
                                key={status.value}
                                variant={selectedStatus === status.value ? "default" : "outline"}
                                className={cn("justify-start h-12 relative overflow-hidden", selectedStatus === status.value && "border-primary")}
                                onClick={() => handleSelect(status.value)}
                            >
                                <status.icon className={cn("mr-2 h-4 w-4", selectedStatus === status.value ? "text-primary-foreground" : "text-muted-foreground")} />
                                <span>{status.label}</span>
                                {selectedStatus === status.value && (
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
                    Filter by Status
                </div>
                {paymentStatuses.map((status) => (
                    <div
                        key={status.value}
                        className={cn(
                            "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                            selectedStatus === status.value ? "bg-accent/50" : ""
                        )}
                        onClick={() => handleSelect(status.value)}
                    >
                        <span className="flex-1">{status.label}</span>
                        {selectedStatus === status.value && (
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
                            fullWidth ? "w-full" : "w-[140px]",
                            selectedStatus && "text-foreground bg-accent/50 border-accent-foreground/50",
                        )}
                    >
                        <span className="truncate mr-2">
                            {getButtonLabel()}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[90vh] flex flex-col fixed bottom-0 left-0 right-0">
                    <DrawerHeader className="flex-none">
                        <DrawerTitle>Select Payment Status</DrawerTitle>
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
                        selectedStatus && "text-foreground bg-accent/50 border-accent-foreground/50",
                    )}
                >
                    <span className="truncate mr-2">
                        {getButtonLabel()}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {paymentStatuses.map((status) => (
                    <DropdownMenuItem
                        key={status.value}
                        onClick={() => handleSelect(status.value)}
                        className={cn(
                            selectedStatus === status.value && "bg-accent"
                        )}
                    >
                        {status.label}
                    </DropdownMenuItem>
                ))}
                {selectedStatus && (
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
