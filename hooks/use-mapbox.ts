"use client";

import { useState, useEffect } from 'react';

export function useMapbox() {
    const [isLoaded, setIsLoaded] = useState(false);
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    useEffect(() => {
        if (mapboxToken) {
            setIsLoaded(true);
        }
    }, [mapboxToken]);

    return { isLoaded, mapboxToken };
}
