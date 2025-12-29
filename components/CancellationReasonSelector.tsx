"use client";

import {
    XCircle,
    UserX,
    UserMinus,
    Copy,
    Eraser,
    Banknote,
    Car,
    CalendarX,
    HelpCircle,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const REASON_OPTIONS = [
    { label: "Customer Cancelled", icon: UserX, value: "Customer Cancelled" },
    { label: "Driver Cancelled", icon: UserMinus, value: "Driver Cancelled" },
    { label: "Provider Cancelled", icon: Building2, value: "Provider Cancelled" },
    { label: "Double Booking", icon: Copy, value: "Double Booking" },
    { label: "Mistake Entry", icon: Eraser, value: "Mistake Entry" },
    { label: "Rate/Price Issue", icon: Banknote, value: "Rate/Price Issue" },
    { label: "Vehicle Issue", icon: Car, value: "Vehicle Issue" },
    { label: "No Availability", icon: CalendarX, value: "No Availability" },
    { label: "Other", icon: HelpCircle, value: "Other" }
];

interface CancellationReasonSelectorProps {
    selectedReason: string;
    onReasonChange: (reason: string) => void;
    customReason: string;
    onCustomReasonChange: (reason: string) => void;
    className?: string;
    compact?: boolean;
}

export function CancellationReasonSelector({
    selectedReason,
    onReasonChange,
    customReason,
    onCustomReasonChange,
    className,
    compact = false
}: CancellationReasonSelectorProps) {
    if (compact) {
        return (
            <div className={cn("space-y-4", className)}>
                <Select value={selectedReason} onValueChange={onReasonChange}>
                    <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="Select cancellation reason" />
                    </SelectTrigger>
                    <SelectContent>
                        {REASON_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            return (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        <span>{option.label}</span>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>

                <div className={cn(
                    "space-y-2 transition-all duration-300 overflow-hidden",
                    selectedReason === 'Other' ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                )}>
                    <Textarea
                        value={customReason}
                        onChange={(e) => onCustomReasonChange(e.target.value)}
                        placeholder="Please provide specifics..."
                        className="h-20 resize-none text-sm"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {REASON_OPTIONS.map((option) => {
                    const isSelected = selectedReason === option.value;
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onReasonChange(option.value)}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 gap-2 rounded-lg border-2 transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                                isSelected
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-muted bg-card text-muted-foreground"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-[11px] font-medium text-center leading-tight">{option.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className={cn(
                "space-y-2 transition-all duration-300 overflow-hidden",
                selectedReason === 'Other' ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <Label>Specific Reason</Label>
                <Textarea
                    value={customReason}
                    onChange={(e) => onCustomReasonChange(e.target.value)}
                    placeholder="Please provide text details..."
                    className="h-20 resize-none text-sm"
                />
            </div>
        </div>
    );
}
