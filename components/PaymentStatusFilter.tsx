"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
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

type PaymentStatus = 'paid' | 'unpaid' | 'overdue' | 'scheduled';

const paymentStatuses: { value: PaymentStatus; label: string }[] = [
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'scheduled', label: 'Scheduled' },
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

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
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
                        {selectedStatus ? (
                            paymentStatuses.find(ps => ps.value === selectedStatus)?.label
                        ) : (
                            "Payment"
                        )}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
