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
