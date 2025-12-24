"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
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

export function PaymentStatusFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = React.useState(false);

    // Parse selected statuses from URL
    const selectedStatuses = React.useMemo(() => {
        const param = searchParams.get("paymentStatus");
        if (!param) return [];
        return param.split(',').filter((s): s is PaymentStatus =>
            paymentStatuses.some(ps => ps.value === s)
        );
    }, [searchParams]);

    const handleToggle = (status: PaymentStatus) => {
        const params = new URLSearchParams(searchParams.toString());

        let newSelected: PaymentStatus[];
        if (selectedStatuses.includes(status)) {
            // Remove status
            newSelected = selectedStatuses.filter(s => s !== status);
        } else {
            // Add status
            newSelected = [...selectedStatuses, status];
        }

        if (newSelected.length === 0) {
            params.delete("paymentStatus");
        } else {
            params.set("paymentStatus", newSelected.join(','));
        }

        router.push(`/my-jobs?${params.toString()}`);
    };

    const clearAll = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("paymentStatus");
        router.push(`/my-jobs?${params.toString()}`);
        setOpen(false);
    };

    const getButtonLabel = () => {
        if (selectedStatuses.length === 0) return "All Payment Statuses";
        if (selectedStatuses.length === 1) {
            const status = paymentStatuses.find(ps => ps.value === selectedStatuses[0]);
            return status?.label || "Payment Status";
        }
        return `${selectedStatuses.length} Statuses`;
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full sm:w-auto justify-between text-muted-foreground font-normal",
                        selectedStatuses.length > 0 && "text-foreground"
                    )}
                >
                    {getButtonLabel()}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {paymentStatuses.map((status) => (
                    <DropdownMenuCheckboxItem
                        key={status.value}
                        checked={selectedStatuses.includes(status.value)}
                        onCheckedChange={() => handleToggle(status.value)}
                    >
                        {status.label}
                    </DropdownMenuCheckboxItem>
                ))}
                {selectedStatuses.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={false}
                            onCheckedChange={clearAll}
                            className="text-muted-foreground"
                        >
                            Clear All
                        </DropdownMenuCheckboxItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
