import { useState } from 'react';

export const useSettings = () => {
    // Mock settings for now, ideally fetched from a context or API
    const [settings] = useState({
        fuelPrice: 1.50, // £ per litre
        fuelEfficiency: 45, // mpg
        maintenanceCost: 0.15, // £ per mile
        operatorFee: 0, // %
        airportFee: 7, // £
        targetProfit: 1.00, // £ per mile
    });

    return { settings };
};
