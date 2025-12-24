"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Filter, Calendar, CreditCard, Clock } from "lucide-react";
import { DateRangeFilter } from "./DateRangeFilter";
import { PaymentStatusFilter } from "./PaymentStatusFilter";
import { TimeOfDayFilter } from "./TimeOfDayFilter";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { Separator } from "./ui/separator";

export function MobileJobFilterSheet() {
    const searchParams = useSearchParams();

    // Count active filters
    const hasDate = searchParams.has("dateFrom");
    const hasPayment = searchParams.has("paymentStatus");
    const hasTime = searchParams.has("timeOfDay");
    const activeCount = [hasDate, hasPayment, hasTime].filter(Boolean).length;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                            {activeCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
                <SheetHeader className="pb-4">
                    <SheetTitle>Filter Jobs</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 py-4 overflow-y-auto max-h-full">
                    {/* Date Filter Selection */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Date Range
                        </h3>
                        <div className="w-full">
                            <DateRangeFilter mobileMode />
                        </div>
                    </div>

                    <Separator />

                    {/* Payment Status */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Payment Status
                        </h3>
                        <div className="w-full">
                            <PaymentStatusFilter fullWidth />
                        </div>
                    </div>

                    <Separator />

                    {/* Time of Day */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Time of Day
                        </h3>
                        <div className="w-full">
                            <TimeOfDayFilter fullWidth />
                        </div>
                    </div>
                </div>

                <SheetFooter className="pt-4 border-t mt-auto">
                    <SheetClose asChild>
                        <Button className="w-full" size="lg">Show Results</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
