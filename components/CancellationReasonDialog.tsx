"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MyJob, ProcessedJob } from '@/types';
import { updateJob } from '@/app/actions/jobActions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { CancellationReasonSelector } from './CancellationReasonSelector';

interface CancellationReasonDialogProps {
    job: ProcessedJob | MyJob;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CancellationReasonDialog({ job, open, onOpenChange, onSuccess }: CancellationReasonDialogProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [customReason, setCustomReason] = useState<string>('');

    const handleSave = async () => {
        if (!job._id) return;

        if (!selectedReason) {
            toast({
                variant: "destructive",
                title: "Reason Required",
                description: "Please select a cancellation reason.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const finalReason = selectedReason === 'Other' ? customReason : selectedReason;

            // If checking 'Other', ensure they typed something
            if (selectedReason === 'Other' && !customReason.trim()) {
                toast({
                    variant: "destructive",
                    title: "Reason Required",
                    description: "Please specify the reason.",
                });
                setIsLoading(false);
                return;
            }

            const updateData: any = {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: finalReason,
                // Clear no-show data if present
                noShowAt: null,
                noShowWaitTime: null
            };

            const result = await updateJob(job._id, updateData);

            if (result.success) {
                toast({
                    title: "Job Cancelled",
                    description: "Job has been marked as cancelled.",
                });
                onOpenChange(false);
                if (onSuccess) onSuccess();
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to cancel job.",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <XCircle className="h-5 w-5" /> Cancel Job
                    </DialogTitle>
                    <DialogDescription>
                        Why is this job being cancelled? This helps track performance ensuring accuracy.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    <CancellationReasonSelector
                        selectedReason={selectedReason}
                        onReasonChange={setSelectedReason}
                        customReason={customReason}
                        onCustomReasonChange={setCustomReason}
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Keep Job</Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !selectedReason}
                        variant="destructive"
                        className="min-w-[140px]"
                    >
                        {isLoading ? "Cancelling..." : "Confirm Cancellation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
