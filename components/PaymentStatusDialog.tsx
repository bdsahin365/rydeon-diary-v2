"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Save, Clock, Wallet, CheckCircle, XCircle } from 'lucide-react';
import type { MyJob, PaymentStatus } from '@/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type PaymentStatusDialogProps = {
    job: MyJob;
    children: React.ReactNode;
    onSave: (jobId: string, status: PaymentStatus, dueDate?: string | null, notes?: string) => void;
};

const statusConfig: Record<PaymentStatus, { label: string; icon: React.ElementType; color: string }> = {
    unpaid: { label: 'Unpaid', icon: Wallet, color: 'bg-amber-500' },
    paid: { label: 'Paid', icon: CheckCircle, color: 'bg-green-500' },
    'payment-scheduled': { label: 'Scheduled', icon: Clock, color: 'bg-blue-500' },
    overdue: { label: 'Overdue', icon: XCircle, color: 'bg-destructive' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-gray-500' },
};

export function PaymentStatusDialog({ job, children, onSave }: PaymentStatusDialogProps) {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<PaymentStatus>('unpaid');
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (open) {
            setStatus(job.paymentStatus || 'unpaid');
            setDueDate(job.paymentDueDate ? parseISO(job.paymentDueDate) : undefined);
            setNotes('');
        }
    }, [open, job]);

    const handleSave = () => {
        if (job.myJobId || job._id) {
            onSave(job.myJobId || job._id!, status, dueDate ? format(dueDate, 'yyyy-MM-dd') : null, notes);
            setOpen(false);
        }
    };

    const isDateRequired = status === 'payment-scheduled';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Payment Status</DialogTitle>
                    <DialogDescription>
                        Log the payment status for this job. Each change is recorded with a timestamp.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>New Status</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <Button key={key} variant={status === key ? 'default' : 'outline'} onClick={() => setStatus(key as PaymentStatus)}>
                                    {config.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {isDateRequired && (
                        <div className="space-y-2 pt-4">
                            <Label>Set a new payment due date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, "PPP") : <span>Choose payment date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., 'Payment confirmed via email.'" />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Payment History</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                            {job.paymentHistory && job.paymentHistory.length > 0 ? (
                                job.paymentHistory.slice().reverse().map((entry, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm">
                                        <div className={cn("mt-1 h-2.5 w-2.5 rounded-full", statusConfig[entry.status as PaymentStatus]?.color || 'bg-gray-400')} />
                                        <div className="flex-1">
                                            <p className="font-semibold capitalize">{entry.status}</p>
                                            <p className="text-xs text-muted-foreground">{format(parseISO(entry.date), "dd MMM yyyy 'at' hh:mm a")}</p>
                                            {entry.notes && <p className="text-xs italic text-muted-foreground">"{entry.notes}"</p>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No payment history recorded.</p>
                            )}
                        </div>
                    </div>

                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isDateRequired && !dueDate}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
