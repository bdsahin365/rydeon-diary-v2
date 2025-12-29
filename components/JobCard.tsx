"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar as CalendarIcon,
    MoreVertical,
    MapPin,
    Car,
    Edit,
    Trash,
    Archive,
    CreditCard,
    CheckCircle,
    XCircle,
    AlertCircle,
    Undo2,
    Receipt,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { deleteJob, archiveJob, updateJob } from "@/app/actions/jobActions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { JobEditSheet } from "@/components/JobEditSheet";
import { JobDetailsSheet } from "@/components/JobDetailsSheet";
import { PaymentStatusDialog } from "@/components/PaymentStatusDialog";
import { NoShowDialog } from "@/components/NoShowDialog";
import { ProcessedJob, PaymentStatus, MyJob } from "@/types";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Job {
    _id?: string;
    id?: number | string;
    jobRef?: string;
    originalFirebaseId?: string;
    bookedAt?: string;
    bookingDate?: string;
    bookingTime?: string;
    pickup: string;
    dropoff: string;
    vehicle: string;
    price: string | number;
    distance: string;
    duration?: string;
    notes?: string;
    operator?: string;
    customerName?: string;
    customerPhone?: string;
    status?: string;
    paymentStatus?: string;
    type?: string;
    profit?: number;
    isPaid?: boolean;
    fare?: number;
    timings?: {
        pickup: string;
        dropoff: string;
    };
    name?: string; // Optional legacy field
    date?: string; // Optional legacy field
    noShowAt?: string | Date;
    noShowWaitTime?: number;
    expenses?: any[];
    originalFare?: number;
    operatorFee?: number;
    airportFee?: number;
    includeAirportFee?: boolean;
}

interface JobCardProps {
    job: Job;
    onEdit?: (job: Job) => void;
    onDelete?: (job: Job) => void;
    onArchive?: (job: Job) => void;
    highlightStatus?: 'active' | 'next' | undefined;
}

const FlightLandingIcon = ({ className }: { className?: string }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M11.6992 10.5061C12.0038 10.5062 12.2499 10.7654 12.25 11.0862C12.25 11.4071 12.0039 11.6662 11.6992 11.6663H2.88379C2.57928 11.666 2.33301 11.407 2.33301 11.0862C2.33314 10.7655 2.57935 10.5064 2.88379 10.5061H11.6992ZM7.2793 8.55298C7.57508 8.63005 7.75481 8.94437 7.68164 9.2561C7.60844 9.56761 7.31057 9.757 7.01465 9.67993C6.71893 9.60281 6.5394 9.28932 6.6123 8.97778C6.68546 8.66612 6.98342 8.47605 7.2793 8.55298ZM6.3252 2.01294C6.34315 1.81586 6.53828 1.69531 6.71094 1.77563L7.39941 2.09692C7.54024 2.16167 7.64952 2.28696 7.69824 2.44165L8.93262 6.30103L11.0537 7.29126C11.5393 7.5187 11.7598 8.11955 11.5439 8.6311C11.3281 9.14269 10.7589 9.37566 10.2715 9.14771L3.59668 6.03442L3.38086 5.93286C2.89367 5.70499 2.63158 5.14371 2.75586 4.59888L3.18555 2.72485C3.22659 2.55068 3.40881 2.45587 3.56543 2.52856L3.83789 2.65649C3.95152 2.70854 4.03863 2.81492 4.07031 2.94458L4.37988 4.17993L6.05859 4.96216L6.3252 2.01294ZM5.69043 7.82739C5.98621 7.90447 6.16594 8.21878 6.09277 8.53052C6.01944 8.84184 5.7216 9.03139 5.42578 8.95435C5.13002 8.87726 4.95027 8.56295 5.02344 8.25122C5.09669 7.93981 5.39456 7.75038 5.69043 7.82739Z" fill="currentColor" />
    </svg>
);

const FlightTakeoffIcon = ({ className }: { className?: string }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M11.1162 10.5061C11.4207 10.5064 11.6669 10.7655 11.667 11.0862C11.667 11.407 11.4207 11.666 11.1162 11.6663H2.30078C1.99612 11.6662 1.75 11.4071 1.75 11.0862C1.7501 10.7653 1.99618 10.5062 2.30078 10.5061H11.1162ZM9.94043 1.94165C10.372 1.62377 11.0051 1.71708 11.3516 2.15063C11.698 2.58453 11.6321 3.1964 11.1992 3.51587L5.27637 7.89478L5.08496 8.0354C4.6523 8.35483 4.03376 8.31748 3.61426 7.94849L2.17188 6.67603C2.03851 6.55685 2.04218 6.35221 2.18066 6.24927L2.42285 6.06958C2.52277 5.99462 2.65812 5.96919 2.78711 6.00317L4.02051 6.32056L5.50977 5.21997L3.04492 3.57739C2.88051 3.46751 2.86764 3.23859 3.02051 3.12524L3.63184 2.6731C3.75591 2.58035 3.91806 2.54446 4.07715 2.57544L8.05859 3.33325L9.94043 1.94165ZM7.92773 6.86646C8.12934 6.63683 8.49063 6.61735 8.73633 6.82251C8.98178 7.0277 9.01791 7.37879 8.81641 7.60864C8.61474 7.83833 8.25352 7.85793 8.00781 7.65259C7.76236 7.44738 7.72617 7.09629 7.92773 6.86646ZM9.29004 5.77271C9.4917 5.54302 9.85293 5.52343 10.0986 5.72876C10.3442 5.93402 10.3795 6.28505 10.1777 6.51489C9.97596 6.74455 9.61477 6.76412 9.36914 6.55884C9.12385 6.35349 9.08853 6.00242 9.29004 5.77271Z" fill="currentColor" />
    </svg>
);

export function JobCard({ job, onEdit, onDelete, onArchive, highlightStatus }: JobCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
    const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);
    const [revertConfirmOpen, setRevertConfirmOpen] = useState(false);

    // Optimistic UI State
    const [localJob, setLocalJob] = useState(job);

    // Sync local job with prop updates from server
    useEffect(() => {
        setLocalJob(job);
    }, [job]);

    const isPickupAirport = localJob.pickup?.toLowerCase().includes('airport') || localJob.pickup?.toLowerCase().includes('terminal');
    const isDropoffAirport = localJob.dropoff?.toLowerCase().includes('airport') || localJob.dropoff?.toLowerCase().includes('terminal');

    // Data mapping logic
    const displayName = localJob.customerName || localJob.operator || "N/A";
    const displayStatus = localJob.status || "N/A";

    const canMarkNoShow = () => {
        if (job.noShowAt) return false; // Already marked
        if (job.status !== 'scheduled' && job.status !== 'cancelled') return false;
        if (!job.bookingDate || !job.bookingTime) return false;

        try {
            // Parse job date/time (Assuming DD/MM/YYYY)
            // Note: In client, we might need a robust parser.
            // Let's simple-parse for now matching `app/actions/jobActions.ts` or `time-utils`.
            // format: DD/MM/YYYY and HH:MM
            const [d, m, y] = job.bookingDate.split('/').map(Number);
            const [h, min] = job.bookingTime.split(':').map(Number);
            const jobDate = new Date(y, m - 1, d, h, min);

            // Add 15 minutes grace period
            const gracePeriodEnds = new Date(jobDate.getTime() + 15 * 60000);

            // Compare with current time
            const now = new Date();

            return now > gracePeriodEnds;
        } catch (e) {
            console.error("Error checking No Show eligibility", e);
            return false;
        }
    };

    // Convert 24-hour time to 12-hour format
    const formatTime12Hour = (time24: string) => {
        if (!time24) return time24;
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    let displayDate = "N/A";
    if (localJob.bookingDate && localJob.bookingTime) {
        displayDate = `${localJob.bookingDate} at ${formatTime12Hour(localJob.bookingTime)}`;
    } else if (localJob.date) {
        displayDate = localJob.date;
    } else if (localJob.bookedAt) {
        displayDate = localJob.bookedAt;
    }

    // Parse price (e.g., "£55 NET" -> 55)
    let priceValue = 0;
    let parsedPrice = 0;

    if (localJob.price) {
        const priceString = localJob.price.toString();
        parsedPrice = parseFloat(priceString.replace(/[^\d.]/g, '')) || 0;
    }

    if (parsedPrice > 0) {
        priceValue = parsedPrice;
    } else if (localJob.fare) {
        priceValue = localJob.fare;
    }

    // Profit calculation (mock logic for now, or 0 if not available)
    const profitValue = localJob.profit || 0;

    // Payment Status
    const paymentStatus = localJob.paymentStatus?.toLowerCase() || (localJob.isPaid ? 'paid' : 'unpaid');
    const isPaid = paymentStatus === 'paid';
    const isOverdue = paymentStatus === 'overdue';

    const pickupLocation = localJob.pickup || "N/A";
    const dropoffLocation = localJob.dropoff || "N/A";
    const vehicleType = localJob.vehicle || "N/A";
    const distance = localJob.distance || "N/A";
    const isAirportJob = isPickupAirport || isDropoffAirport;

    const handleSaveJob = async (updatedJob: Partial<ProcessedJob>) => {
        if (!localJob._id) return;
        try {
            // Convert ProcessedJob to IJob format
            const jobUpdate: any = { ...updatedJob };

            // Ensure bookingDate is a string if it's a Date object
            if (jobUpdate.bookingDate instanceof Date) {
                // Convert Date to DD/MM/YYYY format
                const date = jobUpdate.bookingDate;
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                jobUpdate.bookingDate = `${day}/${month}/${year}`;
            }

            const result = await updateJob(localJob._id, jobUpdate);
            if (result.success) {
                toast({ title: "Job Updated", description: "Changes saved successfully." });
                router.refresh();
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error || "Failed to update job." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
        }
    };

    const handlePaymentStatusSave = async (jobId: string, status: PaymentStatus, dueDate?: string | null, notes?: string) => {
        if (!job._id) return;

        const paymentHistoryEntry = {
            status,
            date: new Date().toISOString(),
            notes
        };

        // We need to fetch current history first or just append if we trust the job prop is up to date.
        // For simplicity and since we are in a client component with job prop, we use job.paymentHistory.
        // However, job prop might be stale if other updates happened. Ideally we push to array in backend.
        // But updateJob replaces fields. Let's construct the new history array.
        const currentHistory = (job as any).paymentHistory || [];
        const newHistory = [...currentHistory, paymentHistoryEntry];

        const updateData: any = {
            paymentStatus: status,
            paymentHistory: newHistory
        };

        if (dueDate) {
            updateData.paymentDueDate = dueDate;
        }

        try {
            const result = await updateJob(job._id, updateData);
            if (result.success) {
                toast({ title: "Payment Status Updated", description: `Payment status changed to ${status}.` });
                router.refresh();
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error || "Failed to update payment status." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!job._id) return;
        try {
            const updates: any = { status: newStatus };
            // If moving to scheduled or completed, clear no show flag
            if (newStatus === 'scheduled' || newStatus === 'completed') {
                updates.noShowAt = null;
                updates.noShowWaitTime = null;
            }

            const result = await updateJob(job._id, updates);
            if (result.success) {
                toast({ title: "Status Updated", description: `Job marked as ${newStatus}.` });
                router.refresh();
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error || `Failed to mark as ${newStatus}.` });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
        }
    };

    const handleRevertNoShow = async () => {
        if (!job._id) return;
        try {
            const updatePayload: any = {
                noShowAt: null,
                noShowWaitTime: null,
                status: 'cancelled', // Revert to standard cancelled
                expenses: [] // Clear no-show expenses
            };

            // Restore original fare if available
            // Restore original fare if available
            if (localJob.originalFare !== undefined && localJob.originalFare !== null) {
                const restoredFare = localJob.originalFare;
                updatePayload.fare = restoredFare;
                updatePayload.price = `£${restoredFare.toFixed(2)}`;
                updatePayload.originalFare = null; // Clear the stored original

                // Recalculate Profit based on Restored Fare
                // Using standard defaults identical to NoShowDialog for consistency
                const distanceNum = parseFloat((localJob.distance || '0').replace(/[^\d.]/g, '')) || 0;
                const fuelCost = (distanceNum / 45) * (1.45 * 4.546); // ~45mpg, 1.45/L
                const maintCost = distanceNum * 0.08; // 8p/mile
                const opFee = restoredFare * ((localJob.operatorFee || 0) / 100);
                const airport = localJob.includeAirportFee ? (localJob.airportFee || 0) : 0;
                // No expenses as we just cleared them

                const totalCosts = fuelCost + maintCost + opFee + airport;
                const newProfit = restoredFare - totalCosts;

                updatePayload.profit = newProfit;
            }

            // Optimistic Update
            setLocalJob(prev => ({
                ...prev,
                ...updatePayload,
                // Ensure strictly type-compliant updates if necessary, usually spread works fine
                price: updatePayload.price !== undefined ? updatePayload.price : prev.price,
                profit: updatePayload.profit !== undefined ? updatePayload.profit : prev.profit,
                originalFare: null // Explicitly clear locally
            }));

            const result = await updateJob(localJob._id!, updatePayload);

            if (result.success) {
                toast({
                    title: "No Show Removed",
                    description: "Job reverted to standard Cancelled status and financials restored.",
                });
                router.refresh();
            } else {
                // Revert optimistic update if needed or rely on refresh/toast
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to revert no show",
                });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
        }
    };

    const handleEdit = async () => {
        if (onEdit) {
            onEdit(job);
            return;
        }
        // Default edit behavior if no prop provided
        // Now handled by JobEditSheet wrapper
    };

    const handleDelete = async () => {
        if (onDelete) {
            onDelete(job);
            return;
        }
        if (!job._id) return;

        try {
            const result = await deleteJob(job._id);
            if (result.success) {
                toast({
                    title: "Job Deleted",
                    description: "The job has been successfully deleted.",
                });
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to delete job.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred.",
            });
        }
    };

    const handleArchive = async () => {
        if (onArchive) {
            onArchive(job);
            return;
        }
        if (!job._id) return;

        try {
            const result = await archiveJob(job._id);
            if (result.success) {
                toast({
                    title: "Job Archived",
                    description: "The job has been moved to archive.",
                });
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to archive job.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred.",
            });
        }
    };

    const handleRestore = async () => {
        if (!job._id) return;
        try {
            const result = await updateJob(job._id, { status: 'scheduled' });
            if (result.success) {
                toast({
                    title: "Job Restored",
                    description: "Job has been moved to Scheduled list.",
                });
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to restore job.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred.",
            });
        }
    };

    return (
        <>
            <Card
                className={`
                    bg-card text-card-foreground rounded-xl border group border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
                    ${highlightStatus === 'active' ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/5' :
                        highlightStatus === 'next' ? 'border-sky-400 border-l-4' : 'hover:border-primary/50'}
                `}
                onClick={() => setDetailsSheetOpen(true)}
            >
                <CardContent className="px-3 sm:px-5 py-2 sm:py-3">
                    {/* Active/Next Badge */}
                    {highlightStatus && (
                        <div className={`
                            text-[10px] uppercase font-bold tracking-wider mb-2
                            ${highlightStatus === 'active' ? 'text-blue-600' : 'text-sky-600'}
                        `}>
                            {highlightStatus === 'active' ? 'Current Job' : 'Next Up'}
                        </div>
                    )}

                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                                    {displayName}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className={`
                  ${displayStatus === 'scheduled' ? 'bg-primary/10 text-primary border-primary/20' :
                                            displayStatus === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                'bg-red-500/10 text-red-500 border-red-500/20'}  
                                    font-medium capitalize px-1.5 py-0 rounded-full text-[10px] border shrink-0
                                `}
                                >
                                    {job.noShowAt ? 'No Show' : displayStatus}
                                </Badge>
                            </div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3 shrink-0" />
                                <span className="truncate">{displayDate}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-1.5 sm:gap-3 shrink-0 ml-2">
                            <div className="text-right">
                                <div className="text-base sm:text-lg font-bold text-green-500">£{profitValue.toFixed(2)}</div>
                                <div className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wide">profit</div>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 sm:h-8 sm:w-8 -mt-1 -mr-2 text-muted-foreground hover:text-foreground"
                                            aria-label="More options"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">

                                        {/* Scheduled Jobs Actions */}
                                        {displayStatus === 'scheduled' && !localJob.noShowAt && (
                                            <>
                                                <JobEditSheet job={job as any} onSave={handleSaveJob}>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                </JobEditSheet>

                                                <PaymentStatusDialog job={job as any} onSave={handlePaymentStatusSave}>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        <span>Change Payment Status</span>
                                                    </DropdownMenuItem>
                                                </PaymentStatusDialog>

                                                <JobEditSheet job={job as any} onSave={handleSaveJob} initialTab="finance">
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Receipt className="mr-2 h-4 w-4" />
                                                        <span>Add Reimbursable Expense</span>
                                                    </DropdownMenuItem>
                                                </JobEditSheet>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange('completed');
                                                }}>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                    <span>Mark as Completed</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange('cancelled');
                                                }}>
                                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                    <span>Mark as Cancelled</span>
                                                </DropdownMenuItem>

                                                {canMarkNoShow() && (
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        setNoShowDialogOpen(true);
                                                    }}>
                                                        <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                                                        <span>Mark as No Show</span>
                                                        <span className="ml-auto text-[10px] bg-orange-100 text-orange-600 px-1 rounded">Action Required</span>
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setArchiveDialogOpen(true);
                                                }}>
                                                    <Archive className="mr-2 h-4 w-4" />
                                                    <span>Move to Archive</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteDialogOpen(true);
                                                }} className="text-red-600 focus:text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {/* Completed Jobs Actions */}
                                        {displayStatus === 'completed' && (
                                            <>
                                                <JobEditSheet job={job as any} onSave={handleSaveJob}>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                </JobEditSheet>

                                                <PaymentStatusDialog job={job as any} onSave={handlePaymentStatusSave}>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        <span>Change Payment Status</span>
                                                    </DropdownMenuItem>
                                                </PaymentStatusDialog>

                                                <JobEditSheet job={job as any} onSave={handleSaveJob} initialTab="finance">
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Receipt className="mr-2 h-4 w-4" />
                                                        <span>Add Reimbursable Expense</span>
                                                    </DropdownMenuItem>
                                                </JobEditSheet>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange('scheduled');
                                                }}>
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                                    <span>Mark as Scheduled</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange('cancelled');
                                                }}>
                                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                    <span>Mark as Cancelled</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setArchiveDialogOpen(true);
                                                }}>
                                                    <Archive className="mr-2 h-4 w-4" />
                                                    <span>Move to Archive</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteDialogOpen(true);
                                                }} className="text-red-600 focus:text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {/* No Show Jobs Actions */}
                                        {localJob.noShowAt && (
                                            <>
                                                <PaymentStatusDialog job={job as any} onSave={handlePaymentStatusSave}>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        <span>Change Payment Status</span>
                                                    </DropdownMenuItem>
                                                </PaymentStatusDialog>

                                                <JobEditSheet job={job as any} onSave={handleSaveJob} initialTab="finance">
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Receipt className="mr-2 h-4 w-4" />
                                                        <span>Add Reimbursable Expense</span>
                                                    </DropdownMenuItem>
                                                </JobEditSheet>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRevertConfirmOpen(true);
                                                }}>
                                                    <Undo2 className="mr-2 h-4 w-4" />
                                                    <span>Revert to Cancelled</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setArchiveDialogOpen(true);
                                                }}>
                                                    <Archive className="mr-2 h-4 w-4" />
                                                    <span>Move to Archive</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {/* Cancelled Jobs Actions */}
                                        {displayStatus === 'cancelled' && !localJob.noShowAt && (
                                            <>
                                                <JobEditSheet job={job as any} onSave={handleSaveJob}>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                </JobEditSheet>

                                                <PaymentStatusDialog job={job as any} onSave={handlePaymentStatusSave}>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        <span>Change Payment Status</span>
                                                    </DropdownMenuItem>
                                                </PaymentStatusDialog>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange('scheduled');
                                                }}>
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                                    <span>Mark as Scheduled</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusChange('completed');
                                                }}>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                    <span>Mark as Completed</span>
                                                </DropdownMenuItem>

                                                {canMarkNoShow() && (
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        setNoShowDialogOpen(true);
                                                    }}>
                                                        <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                                                        <span>Mark as No Show</span>
                                                        <span className="ml-auto text-[10px] bg-orange-100 text-orange-600 px-1 rounded">Action Required</span>
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setArchiveDialogOpen(true);
                                                }}>
                                                    <Archive className="mr-2 h-4 w-4" />
                                                    <span>Move to Archive</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteDialogOpen(true);
                                                }} className="text-red-600 focus:text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {/* Archived Jobs Actions */}
                                        {displayStatus === 'archived' && (
                                            <>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRestore();
                                                }}>
                                                    <Undo2 className="mr-2 h-4 w-4" />
                                                    <span>Restore Job</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteDialogOpen(true);
                                                }} className="text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    {/* Route */}
                    <div className="relative space-y-2 sm:space-y-3 mb-1 sm:mb-2">
                        {/* Vertical Line */}
                        <div className="absolute left-2.5 sm:left-3 top-2 sm:top-3 bottom-2 sm:bottom-3 w-0.5 bg-border -ml-[1px] group-hover:bg-primary/20 transition-colors"></div>

                        {/* Pickup */}
                        <div className="flex items-start gap-2.5 sm:gap-3 relative z-10">
                            <div className="w-5 sm:w-6 flex justify-center mt-1 shrink-0">
                                {isPickupAirport ? (
                                    <div className="bg-card rounded-full p-0.5">
                                        <FlightLandingIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                ) : (
                                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-card border-2 border-muted-foreground group-hover:border-primary transition-colors shadow-sm"></div>
                                )}
                            </div>
                            <div className="flex-1 flex justify-between items-start min-w-0">
                                <span className="text-foreground font-medium text-xs sm:text-sm leading-tight pt-0.5 truncate pr-2" title={pickupLocation}>
                                    {pickupLocation}
                                </span>
                            </div>
                        </div>

                        {/* Dropoff */}
                        <div className="flex items-start gap-2.5 sm:gap-3 relative z-10">
                            <div className="w-5 sm:w-6 flex justify-center mt-1 shrink-0">
                                <div className="bg-card rounded-full p-0.5">
                                    {isDropoffAirport ? (
                                        <FlightTakeoffIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    ) : (
                                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 flex justify-between items-start min-w-0">
                                <span className="text-foreground font-medium text-xs sm:text-sm leading-tight pt-0.5 truncate pr-2" title={dropoffLocation}>
                                    {dropoffLocation}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Details */}
                    <div className="flex justify-between items-center pt-1.5 sm:pt-2 border-t border-border mt-1.5 sm:mt-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-1.5 sm:gap-2 border border-border shrink-0">
                                <Car className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                                <span className="text-[10px] sm:text-xs font-medium text-foreground whitespace-nowrap">{vehicleType}</span>
                                <span className="text-muted-foreground text-[10px] sm:text-xs">|</span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{distance}</span>
                                {job.duration && (
                                    <>
                                        <span className="text-muted-foreground text-[10px] sm:text-xs">•</span>
                                        <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{job.duration}</span>
                                    </>
                                )}
                                {isAirportJob && (
                                    <>
                                        <span className="text-muted-foreground text-[10px] sm:text-xs">|</span>
                                        <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                            {isPickupAirport ? (
                                                <FlightLandingIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                            ) : (
                                                <FlightTakeoffIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                            )}
                                            Airport
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="text-right shrink-0 ml-2">
                            <div className="text-sm sm:text-base font-bold text-foreground">£{priceValue.toFixed(2)}</div>
                            <div className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'text-green-600' : isOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                                {paymentStatus}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Job Details Sheet */}
            <JobDetailsSheet
                job={job as ProcessedJob | MyJob}
                open={detailsSheetOpen}
                onOpenChange={setDetailsSheetOpen}
            />

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Move job to Archive?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will hide the job from your main view but keep it in the database for your records.
                            You can restore it later if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleArchive}
                        >
                            Move to Archive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this job?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the job
                            {job.customerName && ` for ${job.customerName}`}
                            {job.bookingDate && ` scheduled for ${job.bookingDate}`}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <NoShowDialog
                job={job as any}
                open={noShowDialogOpen}
                onOpenChange={setNoShowDialogOpen}
            />
            <AlertDialog open={revertConfirmOpen} onOpenChange={setRevertConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revert to Standard Cancelled?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the "No Show" status and all associated data (including evidence notes and calculated charges). The job will be reverted to a standard "Cancelled" status with its original fare restored.
                            <br /><br />
                            Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRevertNoShow}>Confirm Revert</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
