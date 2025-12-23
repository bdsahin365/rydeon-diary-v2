"use client"

import * as React from "react"
import Map, { Marker, Source, Layer, ViewState } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from "lucide-react";

interface Point {
    lat: number;
    lng: number;
}

interface MapViewProps {
    pickupPoint?: Point | null;
    dropoffPoint?: Point | null;
}

export function MapView({ pickupPoint, dropoffPoint }: MapViewProps) {
    const mapToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const [viewState, setViewState] = React.useState<Partial<ViewState>>({
        longitude: -0.1276,
        latitude: 51.5074,
        zoom: 10
    });

    React.useEffect(() => {
        if (pickupPoint && dropoffPoint) {
            // Fit bounds logic could go here, or just center between them
            const midLat = (pickupPoint.lat + dropoffPoint.lat) / 2;
            const midLng = (pickupPoint.lng + dropoffPoint.lng) / 2;
            setViewState({
                longitude: midLng,
                latitude: midLat,
                zoom: 11
            });
        } else if (pickupPoint) {
            setViewState({
                longitude: pickupPoint.lng,
                latitude: pickupPoint.lat,
                zoom: 13
            });
        }
    }, [pickupPoint, dropoffPoint]);

    if (!mapToken) {
        return (
            <div className="w-full h-64 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                <p>Mapbox token not configured</p>
            </div>
        );
    }

    const geojson = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [pickupPoint?.lng || 0, pickupPoint?.lat || 0],
                        [dropoffPoint?.lng || 0, dropoffPoint?.lat || 0]
                    ]
                }
            }
        ]
    };

    return (
        <div className="w-full h-64 rounded-md overflow-hidden border relative">
            <Map
                {...viewState}
                onMove={(evt: { viewState: ViewState }) => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={mapToken}
            >
                {pickupPoint && (
                    <Marker longitude={pickupPoint.lng} latitude={pickupPoint.lat} anchor="bottom">
                        <div className="text-green-600">
                            <MapPin className="h-8 w-8 fill-current" />
                        </div>
                    </Marker>
                )}

                {dropoffPoint && (
                    <Marker longitude={dropoffPoint.lng} latitude={dropoffPoint.lat} anchor="bottom">
                        <div className="text-red-600">
                            <MapPin className="h-8 w-8 fill-current" />
                        </div>
                    </Marker>
                )}

                {pickupPoint && dropoffPoint && (
                    <Source id="route" type="geojson" data={geojson as any}>
                        <Layer
                            id="route"
                            type="line"
                            paint={{
                                'line-color': '#3b82f6',
                                'line-width': 4,
                                'line-opacity': 0.7
                            }}
                        />
                    </Source>
                )}
            </Map>
        </div>
    );
}
