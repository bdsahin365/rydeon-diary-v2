"use client";

import { useMemo, useState, useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Hourglass, Droplets, Wrench, ShieldCheck, ShieldAlert, Plane, Banknote, Route, Percent } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Operator, MyJob } from '@/types';
import { isAirportJob, parsePrice } from '@/lib/utils';
import type { ProcessedJob } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';


type ProfitCalculatorProps = {
    job: ProcessedJob | MyJob;
    distance: string;
    duration: string;
};

const LITRE_PER_GALLON = 4.546;

const parseValue = (text: string): number => {
    if (!text) return 0;
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
}

export function ProfitCalculator({ job, distance: distanceStr, duration: durationStr }: ProfitCalculatorProps) {
    const { settings } = useSettings();
    const [operatorDetails, setOperatorDetails] = useState<Operator | null>(null);

    useEffect(() => {
        if (!job.operator) return;

        const fetchOperator = async () => {
            try {
                const response = await fetch('/api/operators');
                if (response.ok) {
                    const operators = await response.json();
                    const foundOperator = operators.find((op: any) =>
                        op && op.name && op.name.toLowerCase() === job.operator?.toLowerCase()
                    );
                    setOperatorDetails(foundOperator || null);
                }
            } catch (error) {
                console.error('Failed to fetch operator details:', error);
            }
        };

        fetchOperator();
    }, [job.operator]);

    const calculations = useMemo(() => {
        const distance = parseValue(distanceStr); // in miles
        const fare = ((job as MyJob)?.fare ?? job.parsedPrice ?? parsePrice(job.price || '')) || 0;

        const durationMinutes = (() => {
            if (!durationStr) return 0;
            let totalMinutes = 0;
            const hourMatch = durationStr.match(/(\d+)\s*hour/);
            const minMatch = durationStr.match(/(\d+)\s*min/);
            if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
            if (minMatch) totalMinutes += parseInt(minMatch[1]);
            if (!hourMatch && !minMatch && /^\d+$/.test(durationStr.trim())) {
                return parseValue(durationStr);
            }
            if (totalMinutes === 0 && !/^\d+$/.test(durationStr.trim())) {
                return 0;
            }
            return totalMinutes;
        })();


        if (fare === 0) {
            return null;
        }

        // Handle zero distance case - use minimum distance for calculation
        const effectiveDistance = distance === 0 ? 0.1 : distance;

        const commissionRate = (job as MyJob).operatorFee ?? (operatorDetails?.chargesCommission ? (operatorDetails.commissionRate ?? 0) : settings.operatorFee);
        const operatorFeeAmount = fare * (commissionRate / 100);

        const fuelPricePerGallon = settings.fuelPrice * LITRE_PER_GALLON;
        const totalFuelCost = (effectiveDistance / settings.fuelEfficiency) * fuelPricePerGallon;
        const totalMaintenanceCost = effectiveDistance * settings.maintenanceCost;

        const airportFee = (job as MyJob).includeAirportFee ? ((job as MyJob).airportFee ?? settings.airportFee) : 0;

        const totalTripCost = totalFuelCost + totalMaintenanceCost + airportFee + operatorFeeAmount;

        const totalProfit = fare - totalTripCost;

        const profitPerMile = effectiveDistance > 0 ? totalProfit / effectiveDistance : 0;

        const hourlyRate = durationMinutes > 0 ? (totalProfit / durationMinutes) * 60 : 0;

        const minuteRate = durationMinutes > 0 ? totalProfit / durationMinutes : 0;

        const mileRate = distance > 0 ? fare / distance : 0;

        const worthIt = profitPerMile >= settings.targetProfit;

        return {
            fare,
            distance,
            effectiveDistance,
            duration: durationMinutes,
            totalFuelCost,
            totalMaintenanceCost,
            profitPerMile,
            totalTripCost,
            totalProfit,
            hourlyRate,
            minuteRate,
            mileRate,
            worthIt,
            commissionRate,
            operatorFeeAmount,
            airportFee,
        };
    }, [distanceStr, durationStr, job, settings, operatorDetails]);

    if (!calculations) {
        return <p className="text-sm text-muted-foreground">Profitability analysis requires distance and fare data.</p>;
    }

    const formatCurrency = (value: number) => `£${value.toFixed(2)}`;

    const profitMargin = calculations.fare > 0 ? (calculations.totalProfit / calculations.fare) * 100 : 0;

    return (
        <div className="space-y-3">
            {calculations.distance === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800 mb-2">
                    <strong>Note:</strong> Short trip. Using min distance.
                </div>
            )}

            {/* Top Card: Summary */}
            <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 p-4 flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Total profit</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(calculations.totalProfit)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Profit Margin</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{profitMargin.toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">/mile profit</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(calculations.profitPerMile)}</p>
                    </div>
                </div>
                <div className="flex justify-center">
                    <div className={cn(
                        "px-4 py-1 rounded-full text-[10px] font-medium text-white shadow-sm",
                        profitMargin >= 50 ? "bg-emerald-700 dark:bg-emerald-600" :
                            profitMargin >= 30 ? "bg-emerald-600 dark:bg-emerald-500" :
                                profitMargin > 0 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-red-500 dark:bg-red-600"
                    )}>
                        {profitMargin >= 50 ? `Excellent profit margins! (${profitMargin.toFixed(1)}%)` :
                            profitMargin >= 30 ? `Good profit margins (${profitMargin.toFixed(1)}%)` :
                                profitMargin > 0 ? `Low profit margins (${profitMargin.toFixed(1)}%)` :
                                    `Loss making trip (${profitMargin.toFixed(1)}%)`}
                    </div>
                </div>
            </Card>

            {/* Middle Card: Costs */}
            <Card className="p-4 flex flex-col gap-0">
                <div className="space-y-2 text-sm pb-2">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Fuel Cost</span>
                        <span className="font-medium text-foreground">- {formatCurrency(calculations.totalFuelCost)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Maintenance</span>
                        <span className="font-medium text-foreground">- {formatCurrency(calculations.totalMaintenanceCost)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Operator Fee</span>
                        <span className="font-medium text-foreground">- {formatCurrency(calculations.operatorFeeAmount)}</span>
                    </div>
                    {calculations.airportFee > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                            <span>Airport Fee</span>
                            <span className="font-medium text-foreground">- {formatCurrency(calculations.airportFee)}</span>
                        </div>
                    )}
                </div>
                <Separator className="my-0" />
                <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-sm">Total Costs</span>
                    <span className="font-bold text-base text-red-500">- {formatCurrency(calculations.totalTripCost)}</span>
                </div>
            </Card>

            {/* Bottom Card: Rates */}
            <Card className="p-4 flex flex-col gap-0">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-base">Hourly Rate</span>
                    <span className="font-bold text-base text-blue-600">{formatCurrency(calculations.hourlyRate)}/hour</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Profit per mile</span>
                    <span>{formatCurrency(calculations.profitPerMile)}/mile</span>
                </div>
            </Card>
        </div>
    );
}
