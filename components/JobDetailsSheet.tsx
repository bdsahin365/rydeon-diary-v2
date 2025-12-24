"use client";

import { useState, useEffect, useMemo } from 'react';
import { getTripInfo } from '@/ai/flows/get-trip-info';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, Map, Clock, User, Car, Calendar, Phone, Plane, MessageSquare, BaggageClaim, Baby, CircleDot, Flag, Square, Users, Banknote, Copy } from 'lucide-react';
import type { MyJob, ProcessedJob } from '@/types';
import { ProfitCalculator } from './profit-calculator';
import { format } from 'date-fns';
import { cn, formatCountdown, getVehicleLabel, getLocationString } from '@/lib/utils';
import { useCountdown } from '@/hooks/use-countdown';
import { MapView } from './map-view';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent, CardHeader } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';

type JobDetailsSheetProps = {
    job: ProcessedJob | MyJob;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function InfoLine({ icon: Icon, label, value, className }: { icon: React.ElementType, label: string, value: React.ReactNode, className?: string }) {
    if (!value && typeof value !== 'number') return null;
    return (
        <div className={cn("flex items-start gap-3 text-sm", className)}>
            <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
                <span className="font-medium text-muted-foreground">{label}: </span>
                <span className="text-foreground font-semibold">{value}</span>
            </div>
        </div>
    )
}

function RouteDisplay({ pickup, vias = [], dropoff }: { pickup: string | { formatted_address?: string; address?: string; geometry?: any } | null, vias?: string[], dropoff: string | { formatted_address?: string; address?: string; geometry?: any } | null }) {
    const safeVias = Array.isArray(vias) ? vias : [];
    const hasVias = safeVias && safeVias.length > 0;
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
        <div className="space-y-1">
            <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                    <CircleDot className="h-5 w-5 text-green-500" />
                    {(hasVias || dropoffString) && <div className="w-px h-4 my-1 border-l-2 border-dashed border-border" />}
                </div>
                <div className="flex-1 flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground pt-0.5 flex-1">{pickupString}</p>
                    {pickupString !== 'N/A' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => copyToClipboard(pickupString, 'Pickup')}
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {safeVias.map((via, index) => (
                <div key={index} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                        <Square className="h-5 w-5 text-yellow-500" />
                        <div className="w-px h-4 my-1 border-l-2 border-dashed border-border" />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground pt-0.5 flex-1">{via}</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => copyToClipboard(via, `Via ${index + 1}`)}
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            ))}

            {dropoffString && (
                <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                        <Flag className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground pt-0.5 flex-1">{dropoffString}</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => copyToClipboard(dropoffString, 'Dropoff')}
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export function JobDetailsSheet({ job, open, onOpenChange }: JobDetailsSheetProps) {
    const [tripInfo, setTripInfo] = useState<{ distance: string; duration: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const { toast } = useToast();

    const { pickup, dropoff, distance, duration, vias: rawVias } = job;
    const vias = Array.isArray(rawVias) ? rawVias : [];
    const myJobStatus = (job as MyJob).status;
    const { days, hours, minutes } = useCountdown(job.parsedBookingDate);
    const timeRemaining = formatCountdown({ days, hours, minutes });

    useEffect(() => {
        async function fetchTripInfo() {
            if (distance && duration) {
                setTripInfo({ distance, duration });
                setIsLoading(false);
                return;
            }

            const pickupString = getLocationString(pickup);
            const dropoffString = getLocationString(dropoff);

            if (!pickupString || !dropoffString) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const result = await getTripInfo({ origin: pickupString, destination: dropoffString });
                setTripInfo(result);
            } catch (e: any) {
                setError(e.message || "Failed to load trip data.");
            } finally {
                setIsLoading(false);
            }
        }

        if (open) {
            fetchTripInfo();
        }
    }, [pickup, dropoff, distance, duration, job.id, open]);

    const customerName = (job as MyJob).customerName;
    const customerPhone = (job as MyJob).customerPhone;
    const fare = (job as MyJob).fare ?? job.parsedPrice;
    const paymentDueDate = (job as MyJob).paymentDueDate;
    const paymentStatus = (job as MyJob).paymentStatus;

    const nameInitials = customerName ? customerName.split(' ').map(n => n[0]).join('') : (job.operator ? job.operator.substring(0, 2).toUpperCase() : '..');

    const passengers = job.passengers;
    const luggage = job.luggage;
    const childSeat = job.childSeat;

    const passengerString = useMemo(() => {
        if (!passengers || (passengers.adults === 0 && passengers.children === 0 && passengers.infants === 0)) return null;
        const parts = [];
        if (passengers.adults > 0) parts.push(`${passengers.adults} Adult${passengers.adults > 1 ? 's' : ''}`);
        if (passengers.children > 0) parts.push(`${passengers.children} Child${passengers.children > 1 ? 'ren' : ''}`);
        if (passengers.infants > 0) parts.push(`${passengers.infants} Infant${passengers.infants > 1 ? 's' : ''}`);
        return parts.join(', ');
    }, [passengers]);

    const childSeatString = useMemo(() => {
        if (!childSeat || (childSeat.infant === 0 && childSeat.child === 0 && childSeat.booster === 0)) return null;
        const parts = [];
        if (childSeat.infant > 0) parts.push(`Infant ${childSeat.infant}`);
        if (childSeat.child > 0) parts.push(`Child ${childSeat.child}`);
        if (childSeat.booster > 0) parts.push(`Booster ${childSeat.booster}`);
        return parts.join(', ');
    }, [childSeat]);

    const luggageString = useMemo(() => {
        if (!luggage || (luggage.cabin === 0 && luggage.checked === 0)) return null;
        const parts = [];
        if (luggage.cabin > 0) parts.push(`Cabin ${luggage.cabin}`);
        if (luggage.checked > 0) parts.push(`Checked ${luggage.checked}`);
        return parts.join(', ');
    }, [luggage]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side={isDesktop ? "right" : "bottom"} className={cn("p-0 flex flex-col gap-0", isDesktop ? "sm:max-w-xl w-full" : "h-[90vh]")}>
                <SheetHeader className="p-6 pb-2 border-b">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <SheetTitle>Job Details</SheetTitle>
                            <SheetDescription>
                                Comprehensive information about this job
                            </SheetDescription>
                        </div>
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                            <span className="text-xs font-mono font-medium text-muted-foreground">
                                {(job as any).jobRef || (job as any)._id || (job as any).id}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => {
                                    const ref = (job as any).jobRef || (job as any)._id || (job as any).id;
                                    if (ref) {
                                        navigator.clipboard.writeText(ref.toString()).then(() => {
                                            toast({
                                                title: "Job ID Copied",
                                                description: "Job ID copied to clipboard",
                                            });
                                        }).catch(() => {
                                            toast({
                                                variant: "destructive",
                                                title: "Copy Failed",
                                                description: "Failed to copy job ID",
                                            });
                                        });
                                    }
                                }}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    <Tabs defaultValue="details" className="w-full">
                        <div className="px-6 pt-4">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="details">Trip Details</TabsTrigger>
                                <TabsTrigger value="finance">Finance</TabsTrigger>
                                <TabsTrigger value="info">Additional Info</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="px-6 py-4">
                            <TabsContent value="details" className="space-y-4 mt-0">
                                {myJobStatus === 'scheduled' && timeRemaining ? (
                                    <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-center p-3">
                                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-0">Time Until Pickup</p>
                                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-0">{timeRemaining}</p>
                                    </Card>
                                ) : myJobStatus ? (
                                    <Card className={cn("text-center p-3", {
                                        "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800": myJobStatus === 'completed',
                                        "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800": myJobStatus === 'cancelled',
                                    })}>
                                        <p className={cn("text-sm font-semibold", {
                                            "text-green-600 dark:text-green-400": myJobStatus === 'completed',
                                            "text-red-600 dark:text-red-400": myJobStatus === 'cancelled',
                                        })}>Status</p>
                                        <p className={cn("text-2xl font-bold capitalize", {
                                            "text-green-800 dark:text-green-200": myJobStatus === 'completed',
                                            "text-red-800 dark:text-red-200": myJobStatus === 'cancelled',
                                        })}>{myJobStatus}</p>
                                    </Card>
                                ) : null}

                                <div className="space-y-3">
                                    <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
                                        <InfoLine icon={Calendar} label="Pickup Time" value={job.parsedBookingDate ? format(job.parsedBookingDate, "E, dd MMM yyyy 'at' h:mm a") : "N/A"} />
                                        <Card className="mt-2">
                                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-3">
                                                <Avatar>
                                                    <AvatarFallback>{job.operator ? job.operator.substring(0, 2).toUpperCase() : 'N/A'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{job.operator || 'N/A'}</p>
                                                    <p className="text-xs text-muted-foreground">Operator</p>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-foreground mb-3">Trip Route</h4>
                                    <div className="space-y-3 mb-4">
                                        <RouteDisplay pickup={pickup ?? null} vias={vias} dropoff={dropoff ?? null} />
                                    </div>

                                    {isLoading ? (
                                        <div className="space-y-2">
                                            <div className="h-8 w-full bg-muted animate-pulse rounded" />
                                            <div className="h-40 w-full bg-muted animate-pulse rounded" />
                                        </div>
                                    ) : error ? (
                                        <Alert variant="destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>Could not load trip data</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    ) : tripInfo ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <InfoLine icon={Map} label="Distance" value={tripInfo.distance} />
                                                <InfoLine icon={Clock} label="Duration" value={tripInfo.duration} />
                                            </div>
                                            <Button
                                                className="w-full"
                                                variant="outline"
                                                onClick={() => {
                                                    const pickupAddr = getLocationString(pickup);
                                                    const dropoffAddr = getLocationString(dropoff);
                                                    // Universal URL that works on iOS (Apple Maps) and Android (Google Maps)
                                                    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickupAddr)}&destination=${encodeURIComponent(dropoffAddr)}`;
                                                    window.open(url, '_blank');
                                                }}
                                            >
                                                <Map className="mr-2 h-4 w-4" />
                                                Open Directions
                                            </Button>
                                            <MapView pickupPoint={job.pickupPoint} dropoffPoint={job.dropoffPoint} />
                                        </div>
                                    ) : <p className="text-sm text-muted-foreground">No trip info available.</p>}
                                </div>
                            </TabsContent>

                            <TabsContent value="finance" className="space-y-4 mt-0">
                                <Card className="p-4 rounded-lg bg-blue-500/10 border-blue-500/20">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-blue-600 dark:text-blue-400">Total fare</p>
                                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{fare ? `£${fare.toFixed(2)}` : 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{job.parsedBookingDate ? format(job.parsedBookingDate, 'dd MMM yyyy') : 'N/A'}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{myJobStatus || 'Scheduled'}</p>
                                        </div>
                                    </div>

                                    {(paymentStatus || paymentDueDate) && <Separator className="bg-blue-500/20" />}

                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoLine icon={Banknote} label="Payment Status" value={<span className="capitalize">{paymentStatus}</span>} />
                                        <InfoLine icon={Calendar} label="Payment Due" value={paymentDueDate ? format(new Date(paymentDueDate), "E, dd MMM yyyy") : null} />
                                    </div>
                                </Card>

                                {isLoading ? (
                                    <div className="h-20 w-full bg-muted animate-pulse rounded" />
                                ) : tripInfo ? (
                                    <ProfitCalculator job={job as MyJob} distance={tripInfo.distance} duration={tripInfo.duration} />
                                ) : null}
                            </TabsContent>

                            <TabsContent value="info" className="space-y-4 mt-0">
                                {customerName && (
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                                            <Avatar>
                                                <AvatarFallback>{nameInitials}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold">{customerName}</p>
                                                <p className="text-sm text-muted-foreground">{customerPhone || 'No contact'}</p>
                                            </div>
                                            {customerPhone && (
                                                <div className="flex gap-1">
                                                    <Button asChild variant="outline" size="icon" className="h-9 w-9">
                                                        <a href={`https://wa.me/${customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                            <MessageSquare className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button asChild variant="outline" size="icon" className="h-9 w-9">
                                                        <a href={`tel:${customerPhone}`}>
                                                            <Phone className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}
                                        </CardHeader>
                                    </Card>
                                )}

                                {(passengerString || luggageString || childSeatString) && (
                                    <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
                                        <InfoLine icon={Users} label="Passengers" value={passengerString} />
                                        <InfoLine icon={Baby} label="Child Seat" value={childSeatString} />
                                        <InfoLine icon={BaggageClaim} label="Luggage" value={luggageString} />
                                    </div>
                                )}

                                <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
                                    <InfoLine icon={Car} label="Vehicle" value={getVehicleLabel(job)} />
                                    <InfoLine icon={Plane} label="Flight Number" value={job.flightNumber} />
                                    <InfoLine icon={MessageSquare} label="Notes" value={job.notes || null} />
                                    <InfoLine icon={Calendar} label="Job Reference" value={(job as any).jobRef || null} />
                                    <InfoLine
                                        icon={Clock}
                                        label="Created"
                                        value={(job as any).createdAt ? format(new Date((job as any).createdAt), "dd MMM yyyy 'at' h:mm a") : null}
                                    />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}
