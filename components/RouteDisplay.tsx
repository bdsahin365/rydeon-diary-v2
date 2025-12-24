"use client";

import { CircleDot, Flag, Square, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocationString } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RouteDisplayProps {
    pickup: string | { formatted_address?: string; address?: string; geometry?: any } | null;
    vias?: string[];
    dropoff: string | { formatted_address?: string; address?: string; geometry?: any } | null;
}

export function RouteDisplay({ pickup, vias = [], dropoff }: RouteDisplayProps) {
    const safeVias = Array.isArray(vias) ? vias : [];
    const pickupString = getLocationString(pickup, 'N/A');
    const dropoffString = getLocationString(dropoff, '');
    const { toast } = useToast();

    const copyToClipboard = (address: string, type: string) => {
        navigator.clipboard.writeText(address).then(() => {
            toast({
                title: "Address Copied",
                description: `${type} address copied to clipboard`,
            });
        }).catch(() => {
            toast({
                variant: "destructive",
                title: "Copy Failed",
                description: "Failed to copy address to clipboard",
            });
        });
    };

    return (
        <div className="relative pl-2">
            {/* Continuous dashed line background */}
            <div className="absolute left-[19px] top-6 bottom-6 w-px border-l-2 border-dashed border-border" />

            <div className="space-y-6">
                {/* Pickup Section */}
                <div className="relative flex items-start gap-4">
                    <div className="relative z-10 flex flex-col items-center pt-0.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-green-500 bg-background">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        </div>
                    </div>
                    <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
                        <p className="font-semibold text-foreground text-sm leading-tight pt-0.5">
                            {pickupString}
                        </p>
                        {pickupString !== 'N/A' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={() => copyToClipboard(pickupString, 'Pickup')}
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Vias Section */}
                {safeVias.map((via, index) => (
                    <div key={index} className="relative flex items-start gap-4">
                        <div className="relative z-10 flex flex-col items-center pt-0.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-yellow-500 bg-background">
                                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                            </div>
                        </div>
                        <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
                            <p className="font-semibold text-foreground text-sm leading-tight pt-0.5">{via}</p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={() => copyToClipboard(via, `Via ${index + 1}`)}
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}

                {/* Dropoff Section */}
                {dropoffString && (
                    <div className="relative flex items-start gap-4">
                        <div className="relative z-10 flex flex-col items-center pt-0.5">
                            <Flag className="h-5 w-5 text-red-500 fill-red-50" />
                        </div>
                        <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
                            <p className="font-semibold text-foreground text-sm leading-tight pt-0.5">
                                {dropoffString}
                            </p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={() => copyToClipboard(dropoffString, 'Dropoff')}
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
