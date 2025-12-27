"use client";

import * as React from "react";
import { Download, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSearchParams } from "next/navigation";
import { exportJobs } from "@/app/actions/jobActions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ExportJobsDialog() {
    const [open, setOpen] = React.useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="outline" size="icon" className="flex sm:hidden shrink-0 text-muted-foreground bg-card hover:bg-muted">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Export</span>
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Export Jobs</DrawerTitle>
                        <DrawerDescription>
                            Choose how you want to export your jobs.
                        </DrawerDescription>
                    </DrawerHeader>
                    <ExportForm setOpen={setOpen} />
                    <DrawerFooter className="pt-2">
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="hidden sm:flex text-muted-foreground bg-card hover:bg-muted">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Jobs</DialogTitle>
                    <DialogDescription>
                        Choose how you want to export your jobs using your current filters or a custom date range.
                    </DialogDescription>
                </DialogHeader>
                <ExportForm setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    );
}

function ExportForm({ setOpen }: { setOpen: (open: boolean) => void }) {
    const searchParams = useSearchParams();
    const [exportType, setExportType] = React.useState<'current' | 'custom'>('current');
    const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date } | undefined>();
    const [isLoading, setIsLoading] = React.useState(false);

    // Initialise date range with today if not set
    React.useEffect(() => {
        if (!dateRange) {
            const today = new Date();
            setDateRange({ from: today, to: today });
        }
    }, []);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const filters = {
                filter: searchParams.get("filter") || undefined,
                paymentStatus: searchParams.get("paymentStatus") || undefined,
                timeOfDay: searchParams.get("timeOfDay") || undefined,
                search: searchParams.get("search") || undefined,
                operator: searchParams.get("operator") || undefined,
                dateFrom: searchParams.get("dateFrom") || undefined,
                dateTo: searchParams.get("dateTo") || undefined,
            };

            const result = await exportJobs(exportType, filters, dateRange);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (!result.csv) {
                toast.info("No jobs found to export.");
                return;
            }

            // Trigger download
            const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `jobs_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Export successful!");
            setOpen(false);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export jobs.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid gap-4 py-4">
            <div className="grid gap-4">
                <div
                    className={cn(
                        "flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-accent",
                        exportType === 'current' && "border-primary bg-accent/50"
                    )}
                    onClick={() => setExportType('current')}
                >
                    <div className={cn("h-4 w-4 rounded-full border border-primary flex items-center justify-center", exportType === 'current' ? "bg-primary" : "bg-transparent")}>
                        {exportType === 'current' && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="current" className="cursor-pointer font-medium">Current View</Label>
                        <p className="text-xs text-muted-foreground">
                            Export jobs matching your current active filters (search, status, etc.)
                        </p>
                    </div>
                </div>

                <div
                    className={cn(
                        "flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-accent",
                        exportType === 'custom' && "border-primary bg-accent/50"
                    )}
                    onClick={() => setExportType('custom')}
                >
                    <div className={cn("h-4 w-4 rounded-full border border-primary flex items-center justify-center", exportType === 'custom' ? "bg-primary" : "bg-transparent")}>
                        {exportType === 'custom' && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="custom" className="cursor-pointer font-medium">Custom Date Range</Label>
                        <p className="text-xs text-muted-foreground">
                            Export all jobs within a specific date range, ignoring other filters.
                        </p>
                    </div>
                </div>
            </div>

            {exportType === 'custom' && (
                <div className="flex justify-center border rounded-md p-2 bg-background">
                    <Calendar
                        mode="range"
                        selected={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
                        onSelect={(range) => {
                            if (range?.from) {
                                setDateRange({ from: range.from, to: range.to || range.from });
                            }
                        }}
                        numberOfMonths={1}
                        initialFocus
                    />
                </div>
            )}

            <Button onClick={handleExport} disabled={isLoading} className="w-full mt-2">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                    </>
                ) : (
                    <>
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV
                    </>
                )}
            </Button>
        </div>
    );
}
