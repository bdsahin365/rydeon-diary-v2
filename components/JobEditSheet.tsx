"use client";

import { useState, useEffect, useMemo } from 'react';
import type { ProcessedJob, Operator, MyJob, PassengerDetails, LuggageDetails, ChildSeatDetails } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OperatorCombobox } from '@/components/operator-combobox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Save, Info, Car, Wallet, Plus, Minus, User, Baby, Plane, Briefcase, PlusCircle, XCircle, CircleDot, Flag, Square } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/time-picker';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { parseJobDate, isAirportJob } from '@/lib/utils';
import { LocationSearch } from '@/components/location-search';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapView } from '@/components/map-view';
import { useSettings } from '@/hooks/use-settings';
import { Checkbox } from '@/components/ui/checkbox';
import { ProfitCalculator } from '@/components/profit-calculator';
import { getTripInfo } from '@/ai/flows/get-trip-info';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleSelector } from '@/components/vehicle-selector';
import { useMediaQuery } from '@/hooks/use-media-query';
import { createJob, checkJobOverlap } from '@/app/actions/jobActions';
import { createVehicleType, getVehicleTypes } from '@/app/actions/vehicleTypeActions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ResponsiveSelect } from '@/components/responsive-select';
import { ResponsiveDatePicker } from '@/components/responsive-date-picker';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';

type JobEditSheetProps = {
    job?: Partial<ProcessedJob>;
    children: React.ReactNode;
    onSave: (job: Partial<ProcessedJob>) => void;
};

const EMPTY_JOB: Partial<ProcessedJob> = {
    operator: '',
    pickup: '',
    dropoff: '',
    vias: [],
    price: '',
    vehicle: '',
    notes: '',
    bookingDate: format(new Date(), 'dd/MM/yyyy'),
    bookingTime: format(new Date(), 'HH:mm'),
    customerName: '',
    customerPhone: '',
    flightNumber: '',
    operatorFee: 0,
    airportFee: 0,
    includeAirportFee: false,
    distance: '',
    duration: '',
}

function NumberStepper({ value, onChange, min = 0, max = 10 }: { value: number; onChange: (newValue: number) => void; min?: number, max?: number }) {
    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
                <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg w-8 text-center">{value}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    )
}

export function JobEditSheet({ job, children, onSave }: JobEditSheetProps) {
    const [open, setOpen] = useState(false);
    const [editState, setEditState] = useState<Partial<ProcessedJob>>({});
    const [existingOperators, setExistingOperators] = useState<Operator[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
    const { settings } = useSettings();
    const [tripInfo, setTripInfo] = useState({ distance: job?.distance || '', duration: job?.duration || '' });
    const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [overlappingJobs, setOverlappingJobs] = useState<any[]>([]);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const response = await fetch('/api/operators');
                if (response.ok) {
                    const operators = await response.json();
                    setExistingOperators(operators.map((op: any) => ({ id: op._id, ...op })));
                }
            } catch (error) {
                console.error('Failed to fetch operators:', error);
            }
        };

        const fetchVehicleTypes = async () => {
            const result = await getVehicleTypes();
            if (result.success && result.data) {
                // Type assertion or map because data is IVehicleType[]
                setVehicleTypes(result.data.map((vt: any) => vt.name));
            }
        };

        fetchOperators();
        fetchVehicleTypes();
    }, []);

    useEffect(() => {
        if (editState.pickup && editState.dropoff) {
            const fetchTripInfo = async () => {
                try {
                    const result = await getTripInfo({ origin: editState.pickup!, destination: editState.dropoff! });
                    setTripInfo(result);
                    setEditState(prev => ({ ...prev, distance: result.distance, duration: result.duration }));
                } catch (e) {
                    console.error("Failed to fetch trip info", e);
                }
            }
            fetchTripInfo();
        }
    }, [editState.pickup, editState.dropoff]);

    useEffect(() => {
        if (open) {
            const operator = existingOperators.find(op => op && op.name && op.name.toLowerCase() === job?.operator?.toLowerCase());
            if (operator) setSelectedOperator(operator);

            const operatorFee = operator?.chargesCommission ? operator.commissionRate || 0 : settings.operatorFee;

            const initialState: Partial<ProcessedJob & MyJob> = job
                ? {
                    ...job,
                    bookingTime: job.bookingTime || '',
                    bookingDate: job.bookingDate || format(new Date(), 'dd/MM/yyyy'),
                    operatorFee: (job as MyJob).operatorFee ?? operatorFee,
                    fare: job.parsedPrice || (job.price ? parseFloat(job.price.toString().replace(/[£,]/g, '')) : 0),
                    vias: Array.isArray(job.vias) ? job.vias : [],
                    pickup: typeof job.pickup === 'string' ? job.pickup : ((job.pickup as any)?.formatted_address || (job.pickup as any)?.address || ''),
                    dropoff: typeof job.dropoff === 'string' ? job.dropoff : ((job.dropoff as any)?.formatted_address || (job.dropoff as any)?.address || '')
                }
                : { ...EMPTY_JOB, operatorFee };

            if (initialState.includeAirportFee === undefined) {
                initialState.includeAirportFee = isAirportJob(initialState as ProcessedJob);
            }

            if (initialState.includeAirportFee && !initialState.airportFee) {
                initialState.airportFee = settings.airportFee;
            }

            console.log('Initializing JobEditSheet with state:', initialState);
            setEditState(initialState);
        }
    }, [open, job, existingOperators, settings.operatorFee, settings.airportFee]);

    useEffect(() => {
        // Check for overlapping jobs when date, time, or duration changes
        const checkOverlaps = async () => {
            if (!editState.bookingDate || !editState.bookingTime || !editState.duration) {
                setOverlappingJobs([]);
                return;
            }

            try {
                const bookingDateStr = typeof editState.bookingDate === 'string'
                    ? editState.bookingDate
                    : format(editState.bookingDate, 'dd/MM/yyyy');

                const result = await checkJobOverlap(
                    bookingDateStr,
                    editState.bookingTime,
                    editState.duration,
                    job?._id || undefined
                );
                console.log('Overlap check result:', result);
                setOverlappingJobs(result.jobs || []);
            } catch (error) {
                console.error('Failed to check overlaps:', error);
            }
        };

        if (open) {
            checkOverlaps();
        }
    }, [editState.bookingDate, editState.bookingTime, editState.duration, job?._id, open]);

    const handleValueChange = (field: keyof (ProcessedJob & MyJob), value: any) => {
        setEditState(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'operator') {
                const operator = existingOperators.find(op => op && op.name && (op.name as string)?.toLowerCase() === (value as string)?.toLowerCase());
                setSelectedOperator(operator || null);
                if (operator) {
                    newState.operatorFee = operator?.chargesCommission ? operator.commissionRate || 0 : settings.operatorFee;
                }
            }
            if (field === 'paymentStatus' && value !== 'payment-scheduled') {
                newState.paymentDueDate = null;
            }
            return newState;
        });
    };

    const handleIncludeAirportFeeChange = (checked: boolean) => {
        setEditState(prev => ({
            ...prev,
            includeAirportFee: checked,
            airportFee: checked ? (prev.airportFee || settings.airportFee) : 0
        }));
    };

    const handlePassengerChange = (type: keyof PassengerDetails, value: number) => {
        setEditState(prev => ({ ...prev, passengers: { ...(prev.passengers || { adults: 0, children: 0, infants: 0 }), [type]: value } }));
    }
    const handleLuggageChange = (type: keyof LuggageDetails, value: number) => {
        setEditState(prev => ({ ...prev, luggage: { ...(prev.luggage || { cabin: 0, checked: 0 }), [type]: value } }));
    }
    const handleChildSeatChange = (type: keyof ChildSeatDetails, value: number) => {
        setEditState(prev => ({ ...prev, childSeat: { ...(prev.childSeat || { infant: 0, child: 0, booster: 0 }), [type]: value } }));
    }

    const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
        try {
            const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
            if (!mapboxToken) return null;
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&country=GB&limit=1`);
            const data = await res.json();
            if (data?.features?.length > 0) {
                const [lng, lat] = data.features[0].center;
                return { lat, lng };
            }
        } catch (e) {
            console.warn('Geocoding failed', e);
        }
        return null;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload: any = { ...editState };
            // Ensure coordinates are saved when pickup/dropoff edited
            if (payload.pickup) {
                const pt = await geocodeAddress(payload.pickup);
                if (pt) payload.pickupPoint = pt;
            }
            if (payload.dropoff) {
                const pt = await geocodeAddress(payload.dropoff);
                if (pt) payload.dropoffPoint = pt;
            }

            // Use createJob for new jobs, updateJob for existing
            if (job?._id || job?.id) {
                await onSave(payload);
            } else {
                const result = await createJob(payload);
                if (!result.success) {
                    throw new Error(result.error || 'Failed to create job');
                }
                // Note: overlapping jobs warning is already shown in UI
            }
            setOpen(false);
        } catch (error) {
            console.error("Failed to save job", error);
        } finally {
            setIsSaving(false);
        }
    };

    const showChildSeatSection = useMemo(() => {
        const passengers = editState.passengers;
        return passengers && (passengers.children > 0 || passengers.infants > 0);
    }, [editState.passengers]);

    const handleViaChange = (index: number, value: string) => {
        setEditState(prev => {
            const currentVias = Array.isArray(prev.vias) ? prev.vias : [];
            const newVias = [...currentVias];
            newVias[index] = value;
            return { ...prev, vias: newVias };
        });
    };

    const addVia = () => {
        setEditState(prev => {
            const currentVias = Array.isArray(prev.vias) ? prev.vias : [];
            return { ...prev, vias: [...currentVias, ''] };
        });
    };

    const removeVia = (index: number) => {
        setEditState(prev => {
            const currentVias = Array.isArray(prev.vias) ? prev.vias : [];
            const newVias = [...currentVias];
            newVias.splice(index, 1);
            return { ...prev, vias: newVias };
        });
    };


    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side={isDesktop ? "right" : "bottom"} className={cn("p-0 flex flex-col gap-0", isDesktop ? "sm:max-w-xl w-full" : "h-[90vh]")}>
                <SheetHeader className="p-6 pb-2 border-b">
                    <SheetTitle>
                        {job?._id || job?.id
                            ? (job?.jobRef ? `${job.jobRef}` : 'Edit Job Details')
                            : 'Create New Job'}
                    </SheetTitle>
                    <SheetDescription>
                        Make changes to the job details below. Click save when you're done.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {overlappingJobs.length > 0 && (
                        <Alert variant="default" className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertTitle className="text-orange-800 dark:text-orange-200">⚠️ Time Conflict Warning</AlertTitle>
                            <AlertDescription className="text-orange-700 dark:text-orange-300">
                                This job overlaps with {overlappingJobs.length} existing job{overlappingJobs.length > 1 ? 's' : ''}:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    {overlappingJobs.map((job: any, idx: number) => (
                                        <li key={idx} className="text-sm">
                                            <strong>{job.jobRef || `Job ${idx + 1}`}</strong> - {job.bookingTime} ({job.duration})
                                            <br />
                                            <span className="text-xs opacity-90">{job.pickup} → {job.dropoff}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-3 text-xs font-medium">💡 You can still save this job if needed.</p>
                            </AlertDescription>
                        </Alert>
                    )}
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="details">Trip Details</TabsTrigger>
                            <TabsTrigger value="finance">Finance</TabsTrigger>
                            <TabsTrigger value="info">Additional Info</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4 m-0 pb-4">
                            <div className="space-y-1">
                                <Label>Job Status</Label>
                                <ResponsiveSelect
                                    value={(editState as MyJob).status || 'scheduled'}
                                    onValueChange={(value) => handleValueChange('status', value)}
                                    options={[
                                        { value: 'scheduled', label: 'Scheduled' },
                                        { value: 'completed', label: 'Completed' },
                                        { value: 'cancelled', label: 'Cancelled' },
                                    ]}
                                    label="Job Status"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Job Provider (Uber, Bolt, etc.)</Label>
                                <OperatorCombobox
                                    operators={existingOperators}
                                    value={editState.operator || ''}
                                    onChange={(opName) => handleValueChange('operator', opName)}
                                    onOperatorCreated={async (newOperator) => {
                                        setExistingOperators(prev => [...prev, newOperator]);
                                        setSelectedOperator(newOperator);
                                    }}
                                />
                            </div>
                            <VehicleSelector
                                operator={selectedOperator}
                                value={editState.vehicle || null}
                                onChange={async (val) => {
                                    handleValueChange('vehicle', val);
                                    // Check if it's a new type and add it if so
                                    if (val && !vehicleTypes.includes(val)) {
                                        // Optimistically add
                                        setVehicleTypes(prev => [...prev, val]);
                                        // Persist
                                        await createVehicleType(val);
                                    }
                                }}
                                onVehicleAdded={(vehicle, updatedOperator) => {
                                    // This prop was for specific vehicle ASSETS on an operator.
                                    // We are keeping it for backward compatibility if we revert logic, but for now
                                    // we just redirect to general handling.
                                    // Ideally, we should clean up the VehicleSelector signature, but I kept it for minimal breakage.
                                    // Since my new VehicleSelector calls onChange for everything, this might not be called anymore
                                    // unless we kept the "Add Custom" logic separate. 
                                    // But I refactored VehicleSelector to just use onChange.
                                    // The type check TS error was about missing 'availableVehicles', so we add it now.
                                }}
                                availableVehicles={vehicleTypes}
                            />
                            <div className="space-y-1">
                                <Label>Pickup date & time</Label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <ResponsiveDatePicker
                                            date={typeof editState.bookingDate === 'string' ? parse(editState.bookingDate, 'dd/MM/yyyy', new Date()) : editState.bookingDate as Date | undefined}
                                            setDate={(date) => handleValueChange('bookingDate', date ? format(date, 'dd/MM/yyyy') : '')}
                                            placeholder="Set Date"
                                        />
                                    </div>
                                    <TimePicker value={editState.bookingTime} onChange={(time) => handleValueChange('bookingTime', time)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Locations</Label>
                                <LocationSearch icon={CircleDot} onSelect={(val) => handleValueChange('pickup', val.formatted_address || '')} initialValue={editState.pickup} placeholder="Pickup Location" />
                                {Array.isArray(editState.vias) && editState.vias.map((via, index) => (
                                    <div key={index} className="flex items-center gap-2 pl-4">
                                        <LocationSearch icon={Square} onSelect={(val) => handleViaChange(index, val.formatted_address || '')} initialValue={via} placeholder={`Via point ${index + 1}`} />
                                        <Button variant="ghost" size="icon" onClick={() => removeVia(index)}>
                                            <XCircle className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addVia}>
                                    <PlusCircle className="h-4 w-4 mr-2" /> Add Stop
                                </Button>
                                <LocationSearch icon={Flag} onSelect={(val) => handleValueChange('dropoff', val.formatted_address || '')} initialValue={editState.dropoff} placeholder="Dropoff Location" />
                                <MapView pickupPoint={editState.pickupPoint} dropoffPoint={editState.dropoffPoint} />
                                <div className="text-sm text-muted-foreground">
                                    <p>Calculated distance: {tripInfo.distance || '...'}</p>
                                    <p>Estimated duration: {tripInfo.duration || '...'}</p>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="finance" className="space-y-4 m-0 pb-4">
                            <div>
                                <Label>Fare Received</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                                    <Input
                                        type="number"
                                        className="pl-8 text-2xl font-bold h-12"
                                        value={editState.fare || editState.parsedPrice || ''}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            handleValueChange('fare', value);
                                            handleValueChange('price', `£${value}`);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="operatorFee" className="flex-shrink-0">Operator Fee</Label>
                                    <Input type="number" id="operatorFee" className="w-20" value={editState.operatorFee || ''} onChange={(e) => handleValueChange('operatorFee', parseFloat(e.target.value))} />
                                    <span className="text-muted-foreground">%</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="includeAirportFee" checked={editState.includeAirportFee} onCheckedChange={handleIncludeAirportFeeChange} />
                                    <Label htmlFor="includeAirportFee" className="flex-shrink-0">Airport Fee</Label>
                                    {editState.includeAirportFee && (
                                        <>
                                            <Input
                                                type="number"
                                                className="w-20"
                                                value={editState.airportFee || ''}
                                                onChange={(e) => handleValueChange('airportFee', parseFloat(e.target.value))}
                                            />
                                            <span className="text-muted-foreground">£</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {editState.pickup && editState.dropoff && (
                                <ProfitCalculator
                                    job={{ ...editState, parsedPrice: editState.fare || 0 } as MyJob}
                                    distance={tripInfo.distance}
                                    duration={tripInfo.duration}
                                />
                            )}
                        </TabsContent>
                        <TabsContent value="info" className="space-y-4 m-0 pb-4">
                            <div className="space-y-1">
                                <Label>Passenger Name</Label>
                                <Input value={editState.customerName || ''} onChange={(e) => handleValueChange('customerName', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Passenger Phone Number</Label>
                                <Input type="tel" value={editState.customerPhone || ''} onChange={(e) => handleValueChange('customerPhone', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Payment Status</Label>
                                <ResponsiveSelect
                                    value={(editState as MyJob).paymentStatus || 'unpaid'}
                                    onValueChange={(value) => handleValueChange('paymentStatus', value)}
                                    options={[
                                        { value: 'unpaid', label: 'Unpaid' },
                                        { value: 'paid', label: 'Paid' },
                                        { value: 'payment-scheduled', label: 'Payment Scheduled' },
                                        { value: 'overdue', label: 'Overdue' },
                                    ]}
                                    label="Payment Status"
                                />
                            </div>
                            {(editState as MyJob).paymentStatus === 'payment-scheduled' && (
                                <div className="space-y-1">
                                    <Label>Payment Due Date</Label>
                                    <ResponsiveDatePicker
                                        date={(editState as MyJob).paymentDueDate ? new Date((editState as MyJob).paymentDueDate!) : undefined}
                                        setDate={(date) => handleValueChange('paymentDueDate', date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholder="Set Date"
                                    />
                                </div>
                            )}
                            <div className="space-y-1">
                                <Label>Additional note</Label>
                                <Textarea value={editState.notes || ''} onChange={(e) => handleValueChange('notes', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Flight Number</Label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Plane className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={editState.flightNumber || ''}
                                            onChange={(e) => handleValueChange('flightNumber', e.target.value)}
                                            className="pl-9"
                                            placeholder="e.g. BA1492"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 shrink-0"
                                        disabled={!editState.flightNumber}
                                        onClick={() => {
                                            if (editState.flightNumber) {
                                                const flightId = editState.flightNumber.replace(/\s+/g, '');
                                                window.open(`https://www.flightaware.com/live/flight/${flightId}`, '_blank');
                                            }
                                        }}
                                        title="Track on FlightAware"
                                    >
                                        <Plane className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-4 rounded-lg border p-4">
                                <Label className="flex items-center gap-2 mb-2"><Briefcase className="h-4 w-4" /> Requirements</Label>

                                {/* Passengers */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-primary font-semibold">Passengers</Label>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm">Adults</p>
                                        <NumberStepper value={editState.passengers?.adults || 0} onChange={(val) => handlePassengerChange('adults', val)} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm">Children</p>
                                        <NumberStepper value={editState.passengers?.children || 0} onChange={(val) => handlePassengerChange('children', val)} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm">Infants</p>
                                        <NumberStepper value={editState.passengers?.infants || 0} onChange={(val) => handlePassengerChange('infants', val)} />
                                    </div>
                                </div>

                                {showChildSeatSection && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <Label className="text-xs text-primary font-semibold">Child Seats</Label>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm">Infant Seat <span className="text-xs text-muted-foreground">(0-1yr)</span></p>
                                                <NumberStepper value={editState.childSeat?.infant || 0} onChange={(val) => handleChildSeatChange('infant', val)} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm">Child Seat <span className="text-xs text-muted-foreground">(1-4yr)</span></p>
                                                <NumberStepper value={editState.childSeat?.child || 0} onChange={(val) => handleChildSeatChange('child', val)} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm">Booster Seat <span className="text-xs text-muted-foreground">(4yr+)</span></p>
                                                <NumberStepper value={editState.childSeat?.booster || 0} onChange={(val) => handleChildSeatChange('booster', val)} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                {/* Luggage */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-primary font-semibold">Luggage</Label>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm">Cabin Bags</p>
                                        <NumberStepper value={editState.luggage?.cabin || 0} onChange={(val) => handleLuggageChange('cabin', val)} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm">Checked Bags</p>
                                        <NumberStepper value={editState.luggage?.checked || 0} onChange={(val) => handleLuggageChange('checked', val)} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <SheetFooter className="p-6 pt-2 border-t mt-auto">
                    <SheetClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </SheetClose>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
