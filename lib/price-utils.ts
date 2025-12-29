/**
 * Utility functions for handling job prices and formatting.
 */

export const parsePrice = (priceStr: string | number | undefined): number => {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;
    // Remove commas, currency symbols, keep digits and dots
    const cleanStr = priceStr.toString().replace(/,/g, '');
    const match = cleanStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
};

export function getJobPrice(job: any): number {
    // Priority: fare > parsedPrice > price
    // We treat '0' as a potentially invalid/default value if a better value exists.

    // Check fare
    if (typeof job.fare === 'number' && job.fare > 0) return job.fare;

    // Check parsedPrice
    if (typeof job.parsedPrice === 'number' && job.parsedPrice > 0) return job.parsedPrice;

    // Check price (parsed)
    const p = parsePrice(job.price);
    if (p > 0) return p;

    // If all are 0 or missing, return 0.
    return 0;
}

export const formatPrice = (price: number): string => {
    return "£" + price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
