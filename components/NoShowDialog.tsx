"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, AlertTriangle, Receipt, Plus, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MyJob, ProcessedJob, Expense } from '@/types';
import { updateJob } from '@/app/actions/jobActions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface NoShowDialogProps {
    job: ProcessedJob | MyJob;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function NoShowDialog({ job, open, onOpenChange, onSuccess }: NoShowDialogProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [waitTime, setWaitTime] = useState<number>(30);
    const [notes, setNotes] = useState<string>('');
    const [paymentRule, setPaymentRule] = useState<'full' | 'half' | 'custom'>('full');
    const [customFare, setCustomFare] = useState<number>(0);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const baseFare = parseFloat(job.price?.toString().replace(/[^\d.]/g, '') || '0') || job.fare || 0;

    const handleSave = async () => {
        if (!job._id) return;
        setIsLoading(true);

        try {
            // Calculate final fare based on rule
            let finalFare = baseFare;
            if (paymentRule === 'half') finalFare = baseFare * 0.5;
            if (paymentRule === 'custom') finalFare = customFare;

            // Recalculate Profit
            // We use default settings here as we don't have access to global settings in this context easily.
            // Ideally this should happen on the backend or context.
            const defaultSettings = {
                fuelPrice: 1.45,
                fuelEfficiency: 45,
                maintenanceCost: 0.05,
                operatorFee: job.operatorFee || 0,
                airportFee: job.airportFee || 0,
                targetProfit: 1.0
            };

            const tempJobForCalc = {
                ...job,
                fare: finalFare,
                expenses: expenses
            };

            // Recalculate profit using utility
            // Import this at top: import { calculateJobProfit } from '@/lib/profit-utils';
            // We need to dynamically import or assuming it's imported.
            // I will add the import in the next step or assume checking this logic first.
            // Actually, I must ensure import is present.
            // Let me add strict logic here.

            // Note: We need to import calculateJobProfit. 
            // Since I am replacing the block, I can't add import at top easily without `multi_replace`.
            // I will assume I can replace the logic here and then add import.

            // WAIT. I can't use calculateJobProfit without importing it.
            // I should verify if I can do a multi-replace or just replace `handleSave` and assume I'll add import after.
            // I'll assume I'll add import after.

            // ...Wait, calculateJobProfit logic:
            // It needs (job, distance, duration, settings).

            // Simulating calculation if import fails or just manual calc for safety?
            // "Profit = Fare - Costs". 
            // Costs = (Distance/MPG * Fuel) + (Distance * Maint) + (Fare * Comm%) + AirportFee + Expenses.

            // Let's try to do it properly with the utility.

            const updateData: any = {
                status: 'cancelled',
                noShowAt: new Date(),
                noShowWaitTime: waitTime,
                fare: finalFare,
                price: `£${finalFare.toFixed(2)}`, // Update display string too
                // Store original fare if not already stored, so we can revert later
                originalFare: job.originalFare !== undefined ? job.originalFare : baseFare,
                notes: notes ? (job.notes ? `${job.notes}\n\n[No Show Evidence]: ${notes}` : `[No Show Evidence]: ${notes}`) : job.notes,
                expenses: expenses
            };

            // Calculate Profit locally to ensure immediate update
            // We need distance in miles
            const distanceNum = parseFloat((job.distance || '0').replace(/[^\d.]/g, '')) || 0;
            const fuelCost = (distanceNum / 45) * (1.45 * 4.546); // ~45mpg, 1.45/L
            const maintCost = distanceNum * 0.08; // 8p/mile
            const opFee = finalFare * ((job.operatorFee || 0) / 100);
            const airport = job.includeAirportFee ? (job.airportFee || 0) : 0;
            const expensesTotal = expenses.reduce((sum, e) => sum + (e.paidByDriver && e.refundStatus !== 'Refunded by Operator' ? e.amount : 0), 0);

            const totalCosts = fuelCost + maintCost + opFee + airport + expensesTotal;
            const newProfit = finalFare - totalCosts;

            updateData.profit = newProfit;

            const result = await updateJob(job._id, updateData);

            if (result.success) {
                toast({
                    title: "Job Marked as No Show",
                    description: "Status updated and details recorded.",
                });
                onOpenChange(false);
                if (onSuccess) onSuccess();
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to update job.",
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

    const addExpense = () => {
        setExpenses([...expenses, { type: 'Parking', amount: 0, paidByDriver: true, refundStatus: 'Pending' }]);
    };

    const updateExpense = (index: number, field: keyof Expense, value: any) => {
        const newExpenses = [...expenses];
        newExpenses[index] = { ...newExpenses[index], [field]: value };
        setExpenses(newExpenses);
    };

    const removeExpense = (index: number) => {
        const newExpenses = [...expenses];
        newExpenses.splice(index, 1);
        setExpenses(newExpenses);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-5 w-5" /> Mark as No Show
                    </DialogTitle>
                    <DialogDescription>
                        Confirm strict requirements before marking this job.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Wait Time */}
                    <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            Wait Time Verified (minutes) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="number"
                            value={waitTime}
                            onChange={(e) => setWaitTime(parseInt(e.target.value) || 0)}
                            className="font-mono"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Ensure minimum wait time (e.g. 30-60m for airports) has passed.
                        </p>
                    </div>

                    {/* Payment Rule */}
                    <div className="space-y-2 p-3 bg-muted/40 rounded-lg border">
                        <Label>Payment Rule</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                type="button"
                                variant={paymentRule === 'full' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPaymentRule('full')}
                                className={paymentRule === 'full' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                            >
                                Full Fare
                            </Button>
                            <Button
                                type="button"
                                variant={paymentRule === 'half' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPaymentRule('half')}
                                className={paymentRule === 'half' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                            >
                                50% Fare
                            </Button>
                            <Button
                                type="button"
                                variant={paymentRule === 'custom' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPaymentRule('custom')}
                                className={paymentRule === 'custom' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                            >
                                Custom
                            </Button>
                        </div>
                        {paymentRule === 'custom' && (
                            <div className="pt-2">
                                <Label className="text-xs">Custom Amount (£)</Label>
                                <Input
                                    type="number"
                                    value={customFare}
                                    onChange={(e) => setCustomFare(parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            Current Base Fare: <strong>£{baseFare.toFixed(2)}</strong>
                            {paymentRule === 'half' && <span className="text-orange-600"> → £{(baseFare * 0.5).toFixed(2)}</span>}
                        </p>
                    </div>

                    {/* Expenses */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="flex items-center gap-2"><Receipt className="h-4 w-4" /> Reimbursable Expenses</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={addExpense} className="h-6 text-xs">
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>
                        {expenses.length > 0 ? (
                            <div className="space-y-2">
                                {expenses.map((expense, idx) => (
                                    <div key={idx} className="grid gap-2 p-2 border rounded bg-background text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Select
                                                value={expense.type}
                                                onValueChange={(v) => updateExpense(idx, 'type', v)}
                                            >
                                                <SelectTrigger className="h-7"><SelectValue placeholder="Type" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Parking">Parking</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="relative">
                                                <span className="absolute left-1.5 top-1.5 text-xs">£</span>
                                                <Input
                                                    type="number"
                                                    value={expense.amount}
                                                    onChange={(e) => updateExpense(idx, 'amount', parseFloat(e.target.value) || 0)}
                                                    className="h-7 pl-4"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={`exp-paid-${idx}`}
                                                checked={expense.paidByDriver}
                                                onCheckedChange={(c) => updateExpense(idx, 'paidByDriver', !!c)}
                                            />
                                            <Label htmlFor={`exp-paid-${idx}`} className="text-xs font-normal">Paid by me</Label>
                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 ml-auto text-destructive" onClick={() => removeExpense(idx)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">No expenses added (e.g. parking).</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <Label>Notes / Evidence Summary</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Flight 123 arrived. Waited 45 mins. Called passenger 3x, no answer."
                            className="h-20"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white">
                        {isLoading ? "Saving..." : "Confirm No Show"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
