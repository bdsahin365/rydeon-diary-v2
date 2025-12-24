import { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export function useCountdown(targetDate?: Date) {
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        if (!targetDate) {
            setCountdown({ days: 0, hours: 0, minutes: 0 });
            return;
        }

        const calculateCountdown = () => {
            const now = new Date();
            const target = new Date(targetDate);

            if (target <= now) {
                setCountdown({ days: 0, hours: 0, minutes: 0 });
                return;
            }

            const days = differenceInDays(target, now);
            const hours = differenceInHours(target, now) % 24;
            const minutes = differenceInMinutes(target, now) % 60;

            setCountdown({ days, hours, minutes });
        };

        calculateCountdown();
        const interval = setInterval(calculateCountdown, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [targetDate]);

    return countdown;
}
