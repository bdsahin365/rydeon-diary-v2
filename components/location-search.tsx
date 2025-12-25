"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMapbox } from '@/hooks/use-mapbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, X, MapPin } from 'lucide-react';

type Suggestion = {
    place_id: string;
    text: string;
    place_name: string;
    center: [number, number];
};

interface LocationSearchProps {
    onSelect: (place: { formatted_address: string; geometry: { location: { lat: number; lng: number } } }) => void;
    initialValue?: string | null | any;
    placeholder?: string;
    icon?: React.ElementType;
}

export function LocationSearch({ onSelect, initialValue, placeholder, icon: Icon = Search }: LocationSearchProps) {
    const { isLoaded, mapboxToken } = useMapbox();
    const [inputValue, setInputValue] = useState(() => {
        if (typeof initialValue === 'string') return initialValue;
        if (initialValue && typeof initialValue === 'object') {
            // Handle location objects that might have address or formatted_address
            return (initialValue as any).formatted_address || (initialValue as any).address || '';
        }
        return '';
    });
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [debouncedValue, setDebouncedValue] = useState(inputValue);
    const triggerRef = useRef<HTMLDivElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Common UK airports by IATA code
    const airportByCode: Record<string, { name: string; center: [number, number] }> = {
        LHR: { name: 'London Heathrow Airport (LHR), UK', center: [-0.4542955, 51.4700223] },
        LGW: { name: 'London Gatwick Airport (LGW), UK', center: [-0.1821, 51.153662] },
        STN: { name: 'London Stansted Airport (STN), UK', center: [0.262, 51.885] },
        LTN: { name: 'London Luton Airport (LTN), UK', center: [-0.376288, 51.874722] },
        LCY: { name: 'London City Airport (LCY), UK', center: [0.052222, 51.505278] },
        BHX: { name: 'Birmingham Airport (BHX), UK', center: [-1.748, 52.453889] },
        MAN: { name: 'Manchester Airport (MAN), UK', center: [-2.27495, 53.365] },
        EDI: { name: 'Edinburgh Airport (EDI), UK', center: [-3.3725, 55.95] },
        GLA: { name: 'Glasgow Airport (GLA), UK', center: [-4.433, 55.871944] },
        BRS: { name: 'Bristol Airport (BRS), UK', center: [-2.7189, 51.3827] },
        NCL: { name: 'Newcastle Airport (NCL), UK', center: [-1.6917, 55.0375] },
        LPL: { name: 'Liverpool John Lennon Airport (LPL), UK', center: [-2.849722, 53.333611] },
        EMA: { name: 'East Midlands Airport (EMA), UK', center: [-1.328056, 52.831111] },
        BFS: { name: 'Belfast International Airport (BFS), UK', center: [-6.215833, 54.6575] },
        BHD: { name: 'Belfast City Airport (BHD), UK', center: [-5.8725, 54.618056] },
    };

    // Effect to update internal state if the external initialValue changes.
    useEffect(() => {
        // Only update if values differ to avoid loops
        if (initialValue !== undefined && initialValue !== inputValue) {
            let newValue = '';
            if (typeof initialValue === 'string') {
                newValue = initialValue;
            } else if (initialValue && typeof initialValue === 'object') {
                // Handle location objects that might have address or formatted_address
                newValue = (initialValue as any).formatted_address || (initialValue as any).address || '';
            }
            setInputValue(newValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValue]);

    // Manual debounce implementation to avoid hooks order issues
    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, 300);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [inputValue]);

    // Effect to fetch suggestions - always runs
    useEffect(() => {
        if (debouncedValue && open) {
            if (!mapboxToken) {
                // If no token, just show empty suggestions
                setSuggestions([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            const trimmed = String(debouncedValue).trim().toUpperCase();
            const airportSuggestion: Suggestion | null = airportByCode[trimmed]
                ? {
                    place_id: `iata-${trimmed}`,
                    text: trimmed,
                    place_name: airportByCode[trimmed].name,
                    center: airportByCode[trimmed].center,
                }
                : null;

            // UK bounds and bias
            const ukBbox = '-8.649,49.863,1.763,60.860';
            const ukCenter = '-1.5,52.355';

            fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(String(debouncedValue))}.json?access_token=${mapboxToken}&country=GB&bbox=${ukBbox}&proximity=${ukCenter}&language=en&types=address,place,postcode,poi&limit=8`
            )
                .then(response => response.json())
                .then(data => {
                    const apiSuggestions: Suggestion[] = (data.features || []).map((feature: any) => ({
                        place_id: feature.id,
                        text: feature.text,
                        place_name: feature.place_name,
                        center: feature.center,
                    }));
                    const merged = airportSuggestion ? [airportSuggestion, ...apiSuggestions] : apiSuggestions;
                    setSuggestions(merged);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching suggestions:', error);
                    setSuggestions(airportSuggestion ? [airportSuggestion] : []);
                    setIsLoading(false);
                });
        } else if (open) {
            setSuggestions([]);
        }
    }, [debouncedValue, open, mapboxToken]);

    const handleSelect = useCallback((suggestion: Suggestion) => {
        setInputValue(suggestion.place_name);
        onSelect({
            formatted_address: suggestion.place_name,
            geometry: {
                location: {
                    lat: suggestion.center[1],
                    lng: suggestion.center[0],
                },
            },
        });
        setOpen(false);
    }, [onSelect]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (!open) {
            setOpen(true);
        }
    }, [open]);

    const isMobile = useMediaQuery("(max-width: 768px)");

    // Suggestions List Component
    const SuggestionsList = ({ isMobileDrawer = false }: { isMobileDrawer?: boolean }) => (
        <div className="flex flex-col space-y-1 p-2 w-full">
            {isLoading && (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
            {!isLoading && suggestions.length === 0 && String(debouncedValue).length > 2 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found.
                </div>
            )}
            {!isLoading && suggestions.map((suggestion) => (
                <Button
                    key={suggestion.place_id}
                    variant="ghost"
                    className="h-auto justify-start gap-2 w-full px-2 py-3"
                    onPointerDown={(e) => {
                        // Prevent input from losing focus on mobile
                        if (isMobileDrawer) {
                            e.preventDefault();
                        }
                        handleSelect(suggestion);
                    }}
                    type="button"
                >
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="text-left w-full overflow-hidden">
                        <p className="font-semibold truncate">{suggestion.text}</p>
                        <p className="text-xs text-muted-foreground truncate">{suggestion.place_name}</p>
                    </div>
                </Button>
            ))}
        </div>
    );

    const triggerWidth = triggerRef.current?.offsetWidth || 0;

    if (!isLoaded || !mapboxToken) {
        return (
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder || "Enter location..."}
                    className="pl-10"
                    disabled
                />
                <div className="text-xs text-muted-foreground mt-1">
                    Location search requires Mapbox configuration
                </div>
            </div>
        );
    }

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <div className="relative w-full">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <div className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 items-center overflow-hidden whitespace-nowrap",
                            !inputValue && "text-muted-foreground"
                        )}>
                            <span className="truncate w-full text-left flex-1 min-w-0">
                                {inputValue || placeholder || "Search for a location..."}
                            </span>
                        </div>
                    </div>
                </DrawerTrigger>
                <DrawerContent className="h-[80vh]">
                    <div className="sr-only">
                        <DrawerTitle>Search Location</DrawerTitle>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder={placeholder || "Search for a location..."}
                                className="pl-10 h-12 text-base"
                                autoFocus
                            />
                            {inputValue && (
                                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setInputValue('')}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="overflow-y-auto max-h-[60vh]">
                            <SuggestionsList isMobileDrawer={true} />
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="relative w-full" ref={triggerRef}>
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={placeholder || "Search for a location..."}
                        className="pl-10 pr-10"
                        disabled={!isLoaded}
                        onClick={() => setOpen(true)}
                    />
                    {inputValue && (
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={(e) => {
                            e.stopPropagation();
                            setInputValue('');
                        }}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent
                style={{ width: `${triggerWidth}px` }}
                className="p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <SuggestionsList />
            </PopoverContent>
        </Popover>
    );
}
