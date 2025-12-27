import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProcessedJob } from "@/types"
import { parse, addDays, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parsePrice = (priceStr: string | number | undefined): number => {
  if (!priceStr) return 0;
  if (typeof priceStr === 'number') return priceStr;
  // Remove commas and currency symbols, keep digits and dots
  const cleanStr = priceStr.toString().replace(/,/g, '');
  const match = cleanStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

export const formatPrice = (price: number): string => {
  return price.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseJobDate = (dateStr: string | Date): Date | undefined => {
  if (dateStr instanceof Date) return dateStr;
  if (!dateStr) return undefined;

  // Try parsing common formats
  const formats = ['dd/MM/yyyy', 'yyyy-MM-dd', 'd MMM yyyy', 'dd MMM yyyy'];
  for (const fmt of formats) {
    const parsed = parse(dateStr, fmt, new Date());
    if (isValid(parsed)) return parsed;
  }
  return undefined;
};

export const isAirportJob = (job: ProcessedJob): boolean => {
  const airports = ['heathrow', 'gatwick', 'stansted', 'luton', 'city airport', 'lcy', 'lhr', 'lgw', 'stn', 'ltn'];
  const text = `${job.pickup} ${job.dropoff}`.toLowerCase();
  return airports.some(airport => text.includes(airport));
};

export const calculateDueDate = (bookingDate: Date, cycle: string | undefined): Date | null => {
  if (!cycle) return null;
  // Simple logic for now, can be expanded based on specific cycle strings
  if (cycle.toLowerCase().includes('weekly')) return addDays(bookingDate, 7);
  if (cycle.toLowerCase().includes('monthly')) return addDays(bookingDate, 30);
  return addDays(bookingDate, 7); // Default
};

export const getLocationString = (
  location: string | { formatted_address?: string; address?: string } | null | undefined,
  fallback: string = ''
): string => {
  if (!location) return fallback;
  if (typeof location === 'string') return location;
  return location.formatted_address || location.address || fallback;
};

export const getVehicleLabel = (job: ProcessedJob | any): string => {
  return job.vehicle || 'N/A';
};

export const formatCountdown = ({ days, hours, minutes, seconds }: { days: number; hours: number; minutes: number; seconds: number }): string | null => {
  if (days < 0 || hours < 0 || minutes < 0 || seconds < 0) return null;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};
