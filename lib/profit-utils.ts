
import type { MyJob, ProcessedJob, Operator } from '@/types';
import { parsePrice } from '@/lib/price-utils';

export const LITRE_PER_GALLON = 4.546;

export interface ProfitSettings {
    fuelPrice: number; // per litre
    fuelEfficiency: number; // mpg
    maintenanceCost: number; // per mile
    operatorFee: number; // percentage
    airportFee: number; // fixed amount
    targetProfit: number; // per mile
}

export interface ProfitCalculationResult {
    fare: number;
    distance: number;
    effectiveDistance: number;
    duration: number; // minutes
    totalFuelCost: number;
    totalMaintenanceCost: number;
    profitPerMile: number;
    totalTripCost: number;
    totalProfit: number;
    hourlyRate: number;
    minuteRate: number;
    mileRate: number;
    worthIt: boolean;
    commissionRate: number;
    operatorFeeAmount: number;
    airportFee: number;
    totalExpenses: number;
}

const parseValue = (text: string): number => {
    if (!text) return 0;
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
}

export function calculateJobProfit(
    job: Partial<ProcessedJob & MyJob>,
    distanceStr: string,
    durationStr: string,
    settings: ProfitSettings,
    operatorDetails?: Operator | null
): ProfitCalculationResult | null {

    const distance = parseValue(distanceStr); // in miles
    // Robustly determine fare
    const fare = (typeof job.fare === 'number' ? job.fare : 0) ||
        (typeof job.parsedPrice === 'number' ? job.parsedPrice : 0) ||
        (typeof job.price === 'number' ? job.price : parsePrice(job.price || '')) || 0;

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
        // We can still calculate costs even without fare, potentially. 
        // But the original component returned null. Let's return null to signify "insufficient data" for full Profit/Loss, 
        // OR we can return negative profit.
        // Original behavior: return null.
        return null;
    }

    // Handle zero distance case - use minimum distance for calculation
    const effectiveDistance = distance === 0 ? 0.1 : distance;

    // Determine commission/operator fee
    // Priority: Job's specific fee -> Operator's commission rate -> Global Default
    let commissionRate = settings.operatorFee;
    if (job.operatorFee !== undefined && job.operatorFee !== null) {
        commissionRate = job.operatorFee;
    } else if (operatorDetails?.chargesCommission) {
        commissionRate = operatorDetails.commissionRate ?? 0;
    }

    const operatorFeeAmount = fare * (commissionRate / 100);

    const fuelPricePerGallon = settings.fuelPrice * LITRE_PER_GALLON;
    const totalFuelCost = (effectiveDistance / settings.fuelEfficiency) * fuelPricePerGallon;
    const totalMaintenanceCost = effectiveDistance * settings.maintenanceCost;

    const airportFee = job.includeAirportFee ? ((job.airportFee !== undefined && job.airportFee !== null) ? job.airportFee : settings.airportFee) : 0;

    // Calculate total expenses (only those NOT refunded by Operator/VIP? Or all? Usually expenses paid by driver reduce profit IF not refunded? 
    // "Profit" usually checks if "Revenue - Costs". 
    // If driver paid (PaidByDriver=true) and RefundStatus="Refunded...", then it's net neutral?
    // User requirement: "Include No Show revenue in: Total fare, Profit, Profit margin".
    // "Expense fields: Type... Amount... Paid by Driver... Refund status".
    // If an expense is "Non-refundable" and "Paid by Driver", it reduces profit.
    // If it is "Refunded", it cancels out? 
    // Let's assume expenses are costs unless refunded.
    // Simplify: Total Trip Cost includes expenses.

    // Actually, usually "Expenses" like Parking are added to the FARE charged to client? Or are they costs?
    // "Allow adding reimbursable expenses". 
    // Let's stick to: Total Profit = Fare - (Fuel + Maintenance + Operator Fee + Airport Fee + Expenses).
    // If expense is reimbursed, maybe it shouldn't count as cost?
    // Let's treat all added expenses as trip costs for now. 

    const expenses = (job.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const totalTripCost = totalFuelCost + totalMaintenanceCost + airportFee + operatorFeeAmount + expenses;

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
        totalExpenses: expenses,
    };
}
