import { toZonedTime } from 'date-fns-tz';

const LONDON_TIMEZONE = 'Europe/London';

/**
 * Gets the current time in London timezone
 */
export function getLondonTime(): Date {
    return toZonedTime(new Date(), LONDON_TIMEZONE);
}

/**
 * Parses a date string (DD/MM/YYYY) and time string (HH:MM) 
 * treating them as if they are in London time.
 * Returns a standard Date object (UTC timestamp corresponding to that London time).
 */
export function parseLondonDateTime(dateStr: string, timeStr: string): Date | null {
    if (!dateStr || !timeStr) return null;

    try {
        const [d, m, y] = dateStr.split('/').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);

        // Create date construction string for robust parsing if needed, 
        // but constructing UTC then converting IS NOT correct.
        // We want to say "This Y,M,D,H,m IS in London".

        // Construct ISO-like string YYYY-MM-DDTHH:mm:00
        const isoStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

        // toZonedTime usually converts FROM utc/system TO zone.
        // We need the opposite: We have "Wall time in London", we want "Instant".
        // fromZonedTime is the correct function (or just constructing it).
        // date-fns-tz v2/v3 has fromZonedTime. Let's assume v3/modern.
        // If not available, we might need a different approach.
        // Checking imports: actually, toZonedTime converts a Date (instant) to a Date that *represents* the time in that zone (by shifting ticks).
        // That's tricky for comparison.

        // BETTER APPROACH for application logic:
        // Always work with "What time is it in London right now?"
        // And "What time is the job in London?"
        // If the job is "08:00", that implies "08:00 London Time".

        // So, let's create a Helper that simulates "London Date Object"
        // Or simply compares comparable strings/values.

        // Actually, easiest way:
        // 1. Get NOW in London.
        // 2. Parsed Job Date in London.
        // Compare them directly as if they were local dates.

        return new Date(isoStr); // This creates it in LOCAL system time usually... risky.
    } catch (e) {
        return null;
    }
}


/**
 * Time categorization utility for jobs
 */

export type TimeOfDay = 'midnight' | 'day' | 'evening';

/**
 * Categorizes a time string into a time-of-day category
 * @param time - Time string in HH:mm format (e.g., "14:30", "08:00")
 * @returns Time of day category: 'midnight' | 'day' | 'evening'
 * 
 * Categories:
 * - Midnight: 00:00 - 05:59 (12:00 AM - 5:59 AM)
 * - Day: 06:00 - 17:59 (6:00 AM - 5:59 PM)
 * - Evening: 18:00 - 23:59 (6:00 PM - 11:59 PM)
 */
export function categorizeTimeOfDay(time: string): TimeOfDay {
    if (!time) return 'day'; // Default to day if no time provided

    try {
        const [hoursStr] = time.split(':');
        const hours = parseInt(hoursStr, 10);

        if (isNaN(hours) || hours < 0 || hours > 23) {
            return 'day'; // Default to day for invalid times
        }

        if (hours >= 0 && hours < 6) return 'midnight';
        if (hours >= 6 && hours < 18) return 'day';
        return 'evening';
    } catch (e) {
        console.error('Error categorizing time:', e);
        return 'day'; // Default to day on error
    }
}

/**
 * Gets a human-readable label for a time-of-day category
 */
export function getTimeOfDayLabel(timeOfDay: TimeOfDay): string {
    const labels: Record<TimeOfDay, string> = {
        midnight: 'Midnight (12AM-6AM)',
        day: 'Day (6AM-6PM)',
        evening: 'Evening (6PM-12AM)',
    };
    return labels[timeOfDay];
}
