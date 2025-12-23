export interface TripInfo {
    distance: string;
    duration: string;
    pickupPoint?: { lat: number; lng: number };
    dropoffPoint?: { lat: number; lng: number };
}

export async function getTripInfo({ origin, destination }: { origin: string; destination: string }): Promise<TripInfo> {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapboxToken) {
        console.warn("No Mapbox token found, using mock data");
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            distance: "15 mi",
            duration: "30 mins"
        };
    }

    try {
        // 1. Geocode Origin
        const pickupResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(origin)}.json?access_token=${mapboxToken}&country=GB&limit=1`
        );
        const pickupData = await pickupResponse.json();
        let pickupPoint = null;
        if (pickupData.features && pickupData.features.length > 0) {
            const [lng, lat] = pickupData.features[0].center;
            pickupPoint = { lat, lng };
        }

        // 2. Geocode Destination
        const dropoffResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxToken}&country=GB&limit=1`
        );
        const dropoffData = await dropoffResponse.json();
        let dropoffPoint = null;
        if (dropoffData.features && dropoffData.features.length > 0) {
            const [lng, lat] = dropoffData.features[0].center;
            dropoffPoint = { lat, lng };
        }

        if (!pickupPoint || !dropoffPoint) {
            throw new Error("Could not geocode locations");
        }

        // 3. Get Directions
        const directionsResponse = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupPoint.lng},${pickupPoint.lat};${dropoffPoint.lng},${dropoffPoint.lat}?access_token=${mapboxToken}`
        );
        const directionsData = await directionsResponse.json();

        if (!directionsData.routes || directionsData.routes.length === 0) {
            throw new Error("No route found");
        }

        const route = directionsData.routes[0];
        const distanceMiles = (route.distance / 1609.34).toFixed(1); // meters to miles
        const durationMins = Math.round(route.duration / 60); // seconds to minutes

        return {
            distance: `${distanceMiles} mi`,
            duration: `${durationMins} mins`,
            pickupPoint,
            dropoffPoint
        };

    } catch (error) {
        console.error("Error fetching trip info:", error);
        return {
            distance: "0 mi",
            duration: "0 mins"
        };
    }
}
