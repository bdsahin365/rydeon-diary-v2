'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { OperatorCombobox } from '@/components/operator-combobox';
import { LocationSearch } from '@/components/location-search';
import { MapView } from '@/components/map-view';
import { Checkbox } from '@/components/ui/checkbox';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
// MongoDB integration - using API routes instead of direct Firebase
import { MessageSquare, Route, Wallet, Loader2, Plus, RefreshCcw, XCircle, ArrowRight, User, Baby, Briefcase, Minus, ArrowLeft, PlusCircle, CircleDot, Flag, Square, Phone, Plane, ShieldCheck } from 'lucide-react';
import { StickyFooter } from '@/components/sticky-footer';
import type { MyJob, Operator, ProcessedJob, PassengerDetails, LuggageDetails, ChildSeatDetails, PaymentHistoryEntry } from '@/types';
import { parsePrice, parseJobDate, isAirportJob, calculateDueDate } from '@/lib/utils';
import { getTripInfo } from '@/ai/flows/get-trip-info';
import { parseProviderMessage } from '@/ai/flows/parse-provider-message';
import { ProfitCalculator } from '@/components/profit-calculator';
import { format, parse } from 'date-fns';
import { VehicleSelector } from '@/components/vehicle-selector';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/time-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickFill } from '@/components/QuickFill';
import { ResponsiveSelect } from '@/components/responsive-select';
import { ResponsiveDatePicker } from '@/components/responsive-date-picker';

const EMPTY_JOB: Partial<MyJob> = {
    pickup: '',
    dropoff: '',
    vias: [],
    fare: 0,
    operator: '',
    operatorFee: 0,
    airportFee: 7,
    includeAirportFee: false,
    customerName: '',
    customerPhone: '',
    status: 'scheduled',
    paymentStatus: 'unpaid',
    paymentDueDate: null,
    paymentHistory: [],
    flightNumber: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    luggage: { cabin: 0, checked: 0 },
    childSeat: { infant: 0, child: 0, booster: 0 },
};

function NumberStepper({ value, onChange, min = 0, max = 10 }: { value: number; onChange: (newValue: number) => void; min?: number, max?: number }) {
    return (
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
                <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg w-8 text-center">{value}</span>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    )
}

const LITRE_PER_GALLON = 4.546;

const parseValue = (text: string): number => {
    if (!text) return 0;
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
}


export default function AddJobPage() {
    const [jobDetails, setJobDetails] = useState<Partial<MyJob>>(EMPTY_JOB);
    const [isParsing, setIsParsing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState<'trip' | 'profit' | 'details'>('trip');
    const [pastedMessage, setPastedMessage] = useState('');
    const [tripInfo, setTripInfo] = useState<{ distance: string, duration: string }>({ distance: '', duration: '' });
    const [existingOperators, setExistingOperators] = useState<Operator[]>([]);
    const profitCardRef = useRef<HTMLDivElement>(null);
    const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);

    const { settings } = useSettings();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const response = await fetch('/api/operators');
                if (response.ok) {
                    const operators = await response.json();
                    setExistingOperators(operators.map((op: Operator & { _id: string }) => ({ id: op._id, ...op })));
                }
            } catch (error) {
                console.error('Failed to fetch operators:', error);
            }
        };
        fetchOperators();
    }, []);

    useEffect(() => {
        if (jobDetails.pickup && jobDetails.dropoff) {
            const fetchTripInfo = async () => {
                try {
                    const result = await getTripInfo({ origin: jobDetails.pickup!, destination: jobDetails.dropoff! });
                    setTripInfo(result);
                    setJobDetails(prev => {
                        const newState = {
                            ...prev,
                            distance: result.distance,
                            duration: result.duration,
                            pickupPoint: result.pickupPoint,
                            dropoffPoint: result.dropoffPoint
                        };
                        const isAirport = isAirportJob(newState as ProcessedJob);
                        newState.includeAirportFee = isAirport;
                        newState.airportFee = settings.airportFee;
                        return newState;
                    });
                } catch (e) {
                    console.error("Failed to fetch trip info", e);
                }
            }
            fetchTripInfo();
        }
    }, [jobDetails.pickup, jobDetails.dropoff, settings.airportFee]);

    const handleParseMessage = async (message?: string, image?: string | null) => {
        const contentToParse = message || pastedMessage;
        if (!contentToParse && !image) return;
        setIsParsing(true);
        try {
            const { jobs } = await parseProviderMessage({
                messageContent: contentToParse || '',
                imageBase64: image || undefined
            });
            if (jobs && jobs.length > 0) {
                const parsed = jobs[0];
                const operator = existingOperators.find(op => op && op.name && op.name.toLowerCase() === parsed.operator?.toLowerCase());
                const operatorFee = operator?.chargesCommission ? operator.commissionRate || 0 : settings.operatorFee;
                if (operator) setSelectedOperator(operator);

                setJobDetails(prev => ({
                    ...prev,
                    operator: parsed.operator || '',
                    pickup: parsed.pickup || '',
                    dropoff: parsed.dropoff || '',
                    price: parsed.price,
                    fare: parsePrice(parsed.price),
                    notes: parsed.notes || '',
                    bookingDate: parsed.bookingDate ? format(parseJobDate(parsed.bookingDate) || new Date(), 'dd/MM/yyyy') : '',
                    bookingTime: parsed.bookingTime || '',
                    operatorFee: operatorFee,
                    customerName: parsed.customerName || '',
                    customerPhone: parsed.customerPhone || '',
                    flightNumber: parsed.flightNumber || '',
                    passengers: parsed.passengers || prev.passengers,
                    luggage: parsed.luggage || prev.luggage,
                }));
                toast({ title: 'Message Parsed!', description: 'Job details have been filled in.' });
            } else {
                toast({ variant: 'destructive', title: 'Parsing Failed', description: 'Could not extract job details from the message.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while parsing.' });
        } finally {
            setIsParsing(false);
        }
    };

    const handleValueChange = (field: keyof MyJob, value: any) => {
        setJobDetails(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'operator') {
                const operator = existingOperators.find(op => op && op.name && op.name.toLowerCase() === (value as string).toLowerCase());
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
    }

    const handlePassengerChange = (type: keyof PassengerDetails, value: number) => {
        setJobDetails(prev => ({ ...prev, passengers: { ...(prev.passengers || { adults: 0, children: 0, infants: 0 }), [type]: value } }));
    }
    const handleLuggageChange = (type: keyof LuggageDetails, value: number) => {
        setJobDetails(prev => ({ ...prev, luggage: { ...(prev.luggage || { cabin: 0, checked: 0 }), [type]: value } }));
    }
    const handleChildSeatChange = (type: keyof ChildSeatDetails, value: number) => {
        setJobDetails(prev => ({ ...prev, childSeat: { ...(prev.childSeat || { infant: 0, child: 0, booster: 0 }), [type]: value } }));
    }

    const handleReset = () => {
        setJobDetails(EMPTY_JOB);
        setPastedMessage('');
        setSelectedOperator(null);
        setCurrentStep('trip');
    }

    const calculateProfit = useMemo(() => {
        const distance = parseValue(tripInfo.distance);
        const fare = jobDetails.fare || 0;

        if (distance === 0 || fare === 0) return 0;

        const commissionRate = jobDetails.operatorFee || 0;
        const operatorFeeAmount = fare * (commissionRate / 100);

        const fuelPricePerGallon = settings.fuelPrice * LITRE_PER_GALLON;
        const totalFuelCost = (distance / settings.fuelEfficiency) * fuelPricePerGallon;
        const totalMaintenanceCost = distance * settings.maintenanceCost;

        const airportFee = jobDetails.includeAirportFee ? (jobDetails.airportFee ?? 0) : 0;

        const totalTripCost = totalFuelCost + totalMaintenanceCost + airportFee + operatorFeeAmount;

        return fare - totalTripCost;
    }, [tripInfo.distance, jobDetails, settings]);

    const handleSaveJob = async () => {
        setIsSubmitting(true);
        const userId = 'default'; // This will be handled by the API route via session

        const bookingDate = parseJobDate(jobDetails.bookingDate as string);
        let paymentDueDate: Date | null = null;
        let paymentStatus: MyJob['paymentStatus'] = jobDetails.paymentStatus || 'unpaid';
        const paymentHistory: PaymentHistoryEntry[] = [{
            status: paymentStatus,
            date: new Date().toISOString(),
            notes: "Job created."
        }];

        if (selectedOperator?.paymentCycle && bookingDate && paymentStatus === 'unpaid') {
            paymentDueDate = calculateDueDate(bookingDate, selectedOperator.paymentCycle);
            if (paymentDueDate) {
                paymentStatus = 'payment-scheduled';
                paymentHistory.push({
                    status: 'payment-scheduled',
                    date: new Date().toISOString(),
                    notes: `Due date calculated based on operator cycle: ${selectedOperator.paymentCycle}`
                });
            }
        }

        let geocodedInfo: Partial<MyJob> = {};

        // If we have points in state, use them. If not, try to fetch them again if addresses exist.
        if (jobDetails.pickup && jobDetails.dropoff) {
            if (jobDetails.pickupPoint && jobDetails.dropoffPoint && jobDetails.distance && jobDetails.duration) {
                geocodedInfo = {
                    distance: jobDetails.distance,
                    duration: jobDetails.duration,
                    pickupPoint: jobDetails.pickupPoint,
                    dropoffPoint: jobDetails.dropoffPoint
                };
            } else {
                try {
                    const tripResponse = await getTripInfo({ origin: jobDetails.pickup, destination: jobDetails.dropoff });
                    geocodedInfo = {
                        distance: tripResponse.distance,
                        duration: tripResponse.duration,
                        pickupPoint: tripResponse.pickupPoint,
                        dropoffPoint: tripResponse.dropoffPoint
                    };
                } catch (e) {
                    console.warn("Could not fetch trip info on save", e);
                }
            }
        }


        const jobToSave: MyJob = {
            ...jobDetails,
            ...geocodedInfo,
            profit: calculateProfit,
            myJobId: '', // Will be set by MongoDB
            originalJobId: 'manual',
            status: 'scheduled',
            paymentStatus: jobDetails.paymentStatus || paymentStatus,
            paymentDueDate: jobDetails.paymentDueDate || (paymentDueDate ? format(paymentDueDate, 'yyyy-MM-dd') : null),
            paymentHistory,
            bookedAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss'),
            // MongoDB will assign _id automatically
            parsedPrice: jobDetails.fare || 0,
            parsedBookingDate: bookingDate,
        };

        try {
            const response = await fetch('/api/my-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobToSave)
            });


            if (response.ok) {
                toast({ title: 'Job Saved!', description: 'The new job has been added to your diary.', className: 'bg-green-100' });
                router.push('/my-jobs');
            } else {
                const data = await response.json();
                if (response.status === 403) {
                    toast({
                        variant: 'destructive',
                        title: 'Limit Reached',
                        description: data.error || 'You have reached the free plan limit.',
                        action: { label: "Upgrade", onClick: () => router.push('/pro') }
                    });
                    return; // Stop here
                }
                throw new Error('Failed to save job');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the job to your diary.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const showChildSeatSection = (jobDetails.passengers?.children || 0) > 0 || (jobDetails.passengers?.infants || 0) > 0;

    return (
        <div className="pb-24 md:pb-0 space-y-6 max-w-3xl mx-auto">
            {/* Progress Stepper */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className={cn("flex items-center justify-center w-8 h-8 rounded-full font-bold transition-colors", currentStep === 'trip' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</div>
                    <span className={cn("font-semibold text-sm hidden sm:inline", currentStep === 'trip' ? "text-primary" : "text-muted-foreground")}>Trip</span>
                </div>
                <div className="h-[2px] flex-1 bg-border mx-4" />
                <div className="flex items-center gap-2">
                    <div className={cn("flex items-center justify-center w-8 h-8 rounded-full font-bold transition-colors", currentStep === 'profit' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</div>
                    <span className={cn("font-semibold text-sm hidden sm:inline", currentStep === 'profit' ? "text-primary" : "text-muted-foreground")}>Profit</span>
                </div>
                <div className="h-[2px] flex-1 bg-border mx-4" />
                <div className="flex items-center gap-2">
                    <div className={cn("flex items-center justify-center w-8 h-8 rounded-full font-bold transition-colors", currentStep === 'details' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>3</div>
                    <span className={cn("font-semibold text-sm hidden sm:inline", currentStep === 'details' ? "text-primary" : "text-muted-foreground")}>Details</span>
                </div>
            </div>

            {currentStep === 'trip' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <QuickFill
                        pastedMessage={pastedMessage}
                        setPastedMessage={setPastedMessage}
                        onParse={handleParseMessage}
                        isParsing={isParsing}
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4 min-w-0 overflow-hidden">
                            <div className="space-y-2">
                                <Label className="text-base">Provider & Vehicle</Label>
                                <OperatorCombobox
                                    operators={existingOperators}
                                    value={jobDetails.operator || ''}
                                    onChange={(opName) => handleValueChange('operator', opName)}
                                    onOperatorCreated={async (newOperator) => {
                                        try {
                                            const res = await fetch('/api/operators', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(newOperator)
                                            });
                                            if (res.ok) {
                                                const savedOp = await res.json();
                                                setExistingOperators(prev => [...prev, { ...newOperator, id: savedOp._id }]);
                                                setSelectedOperator({ ...newOperator, id: savedOp._id });
                                            }
                                        } catch (e) {
                                            console.error("Failed to save operator", e);
                                            setExistingOperators(prev => [...prev, newOperator]);
                                            setSelectedOperator(newOperator);
                                        }
                                    }}
                                />
                                {jobDetails.operator && (
                                    <div className="pt-2 animate-in fade-in zoom-in-95">
                                        <VehicleSelector
                                            operator={selectedOperator}
                                            value={jobDetails.vehicle || null}
                                            onChange={(val) => handleValueChange('vehicle', val)}
                                            onVehicleAdded={(vehicle, updatedOperator) => {
                                                setExistingOperators(prev =>
                                                    prev.map(op => op.id === updatedOperator.id ? updatedOperator : op)
                                                );
                                                setSelectedOperator(updatedOperator);
                                                handleValueChange('vehicle', vehicle);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 overflow-hidden min-w-0">
                                <Label className="text-base">Route</Label>
                                <div className="space-y-2 relative overflow-hidden min-w-0">
                                    <div className="absolute left-[15px] top-[38px] bottom-[38px] w-[2px] bg-border -z-10" />
                                    <LocationSearch
                                        icon={CircleDot}
                                        onSelect={(place) => handleValueChange('pickup', place.formatted_address || '')}
                                        initialValue={jobDetails.pickup}
                                        placeholder="Pickup Location"
                                    />
                                    {jobDetails.vias?.map((via, index) => (
                                        <div key={index} className="flex items-center gap-2 pl-8 relative min-w-0">
                                            <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-border" />
                                            <LocationSearch
                                                icon={Square}
                                                onSelect={(place) => {
                                                    const newVias = [...jobDetails.vias!];
                                                    newVias[index] = place.formatted_address || '';
                                                    handleValueChange('vias', newVias);
                                                }}
                                                initialValue={via}
                                                placeholder={`Via point ${index + 1}`}
                                            />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleValueChange('vias', jobDetails.vias?.filter((_, i) => i !== index))}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <LocationSearch
                                        icon={Flag}
                                        onSelect={(place) => handleValueChange('dropoff', place.formatted_address || '')}
                                        initialValue={jobDetails.dropoff}
                                        placeholder="Dropoff Location"
                                    />
                                </div>
                                <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => handleValueChange('vias', [...(jobDetails.vias || []), ''])}>
                                    <PlusCircle className="h-3 w-3 mr-2" /> Add Stop
                                </Button>
                            </div>
                        </div>

                        <div className="h-[300px] md:h-auto rounded-lg overflow-hidden border bg-muted relative">
                            <MapView pickupPoint={jobDetails.pickupPoint} dropoffPoint={jobDetails.dropoffPoint} />
                            <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur p-2 rounded-md border shadow-sm text-xs flex justify-between items-center">
                                <div>
                                    <span className="text-muted-foreground">Distance:</span>
                                    <span className="font-bold ml-1">{tripInfo.distance || '--'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span className="font-bold ml-1">{tripInfo.duration || '--'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <StickyFooter>
                        <Button onClick={handleReset} variant="ghost" className="flex-1 md:flex-none">Reset</Button>
                        <Button onClick={() => setCurrentStep('profit')} disabled={!jobDetails.pickup || !jobDetails.dropoff} className="flex-1 md:w-auto">
                            Next: Profit <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </StickyFooter>
                </div>
            )}

            {currentStep === 'profit' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Financials</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Total Fare</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">£</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="pl-10 text-3xl font-bold h-16 bg-muted/20"
                                            value={jobDetails.fare || ''}
                                            onChange={(e) => handleValueChange('fare', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Operator Fee (%)</Label>
                                        <Input type="number" value={jobDetails.operatorFee || ''} onChange={(e) => handleValueChange('operatorFee', parseFloat(e.target.value))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Airport Fee (£)</Label>
                                        <div className="flex items-center gap-2">
                                            <Checkbox id="includeAirportFee" checked={jobDetails.includeAirportFee} onCheckedChange={(checked) => {
                                                handleValueChange('includeAirportFee', checked as boolean);
                                                if (checked) handleValueChange('airportFee', settings.airportFee);
                                                // Retain value when unchecked so it doesn't clear the input
                                            }} />
                                            <Input type="number" disabled={!jobDetails.includeAirportFee} value={jobDetails.airportFee || ''} onChange={(e) => handleValueChange('airportFee', parseFloat(e.target.value))} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-lg">Net Profit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProfitCalculator job={{ ...jobDetails, parsedPrice: jobDetails.fare || 0 } as MyJob} distance={tripInfo.distance} duration={tripInfo.duration} />
                            </CardContent>
                        </Card>
                    </div>

                    <StickyFooter>
                        <Button onClick={() => setCurrentStep('trip')} variant="outline" className="flex-1 md:flex-none"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                        <Button onClick={() => setCurrentStep('details')} className="flex-1 md:w-auto">
                            Next: Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </StickyFooter>
                </div>
            )}

            {currentStep === 'details' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    {/* Main Info Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" /> Client & Trip Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 p-6">
                            {/* Client Info */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Passenger Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" value={jobDetails.customerName || ''} onChange={(e) => handleValueChange('customerName', e.target.value)} placeholder="e.g. John Doe" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" type="tel" value={jobDetails.customerPhone || ''} onChange={(e) => handleValueChange('customerPhone', e.target.value)} placeholder="+44..." />
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-2" />

                            {/* Status & Payment */}
                            <div className="grid gap-4 sm:grid-cols-2 bg-muted/30 p-4 rounded-lg border border-dashed">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Job Status</Label>
                                    <ResponsiveSelect
                                        value={jobDetails.status || 'scheduled'}
                                        onValueChange={(value) => handleValueChange('status', value)}
                                        options={[
                                            { value: 'scheduled', label: 'Scheduled' },
                                            { value: 'completed', label: 'Completed' },
                                            { value: 'cancelled', label: 'Cancelled' },
                                        ]}
                                        label="Job Status"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Payment Status</Label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <ResponsiveSelect
                                            value={jobDetails.paymentStatus || 'unpaid'}
                                            onValueChange={(value) => handleValueChange('paymentStatus', value as MyJob['paymentStatus'])}
                                            options={[
                                                { value: 'unpaid', label: 'Unpaid' },
                                                { value: 'paid', label: 'Paid' },
                                                { value: 'payment-scheduled', label: 'Scheduled' },
                                                { value: 'overdue', label: 'Overdue' },
                                            ]}
                                            label="Payment Status"
                                        />
                                        {jobDetails.paymentStatus === 'payment-scheduled' && (
                                            <div className="w-full sm:w-[140px]">
                                                <ResponsiveDatePicker
                                                    date={jobDetails.paymentDueDate ? new Date(jobDetails.paymentDueDate) : undefined}
                                                    setDate={(date) => handleValueChange('paymentDueDate', date ? format(date, 'yyyy-MM-dd') : null)}
                                                    placeholder="Due Date"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Trip Info */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Date</Label>
                                    <ResponsiveDatePicker
                                        date={typeof jobDetails.bookingDate === 'string' && jobDetails.bookingDate ? parse(jobDetails.bookingDate, 'dd/MM/yyyy', new Date()) : jobDetails.bookingDate as Date | undefined}
                                        setDate={(date) => handleValueChange('bookingDate', date ? format(date, 'dd/MM/yyyy') : '')}
                                        placeholder="Select date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Time</Label>
                                    <div className="relative">
                                        <TimePicker
                                            value={jobDetails.bookingTime || format(new Date(), 'HH:mm')}
                                            onChange={(time) => handleValueChange('bookingTime', time)}
                                            className="w-full"
                                        />
                                        <div className="absolute right-3 top-2.5 pointer-events-none">
                                            {/* Clock icon is native in some browsers, but we can add one if needed or rely on browser UI */}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Flight Number</Label>
                                    <div className="relative">
                                        <Plane className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" value={jobDetails.flightNumber || ''} onChange={(e) => handleValueChange('flightNumber', e.target.value)} placeholder="e.g. BA123" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="h-full">
                            <CardHeader className="pb-3 px-4 pt-4">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                    <Briefcase className="w-3 h-3" /> Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0 space-y-5">
                                {/* Passengers */}
                                <div className="space-y-3">
                                    <Label className="text-xs text-primary font-semibold">Passengers</Label>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Adults</span>
                                            <NumberStepper value={jobDetails.passengers?.adults || 0} onChange={(val) => handlePassengerChange('adults', val)} />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Children</span>
                                            <NumberStepper value={jobDetails.passengers?.children || 0} onChange={(val) => handlePassengerChange('children', val)} />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Infants</span>
                                            <NumberStepper value={jobDetails.passengers?.infants || 0} onChange={(val) => handlePassengerChange('infants', val)} />
                                        </div>
                                    </div>
                                </div>

                                {showChildSeatSection && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <Separator />
                                        <Label className="text-xs text-primary font-semibold">Child Seats</Label>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Infant <span className="text-xs text-muted-foreground">(0-1yr)</span></span>
                                                <NumberStepper value={jobDetails.childSeat?.infant || 0} onChange={(val) => handleChildSeatChange('infant', val)} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Child <span className="text-xs text-muted-foreground">(1-4yr)</span></span>
                                                <NumberStepper value={jobDetails.childSeat?.child || 0} onChange={(val) => handleChildSeatChange('child', val)} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Booster <span className="text-xs text-muted-foreground">(4yr+)</span></span>
                                                <NumberStepper value={jobDetails.childSeat?.booster || 0} onChange={(val) => handleChildSeatChange('booster', val)} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                {/* Luggage */}
                                <div className="space-y-3">
                                    <Label className="text-xs text-primary font-semibold">Luggage</Label>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Cabin Bags</span>
                                            <NumberStepper value={jobDetails.luggage?.cabin || 0} onChange={(val) => handleLuggageChange('cabin', val)} />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Checked Bags</span>
                                            <NumberStepper value={jobDetails.luggage?.checked || 0} onChange={(val) => handleLuggageChange('checked', val)} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card className="h-full">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                    <MessageSquare className="w-3 h-3" /> Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 pt-0 h-[calc(100%-3rem)]">
                                <Textarea
                                    value={jobDetails.notes || ''}
                                    onChange={(e) => handleValueChange('notes', e.target.value)}
                                    placeholder="Add any special requirements, flight details, or driver notes here..."
                                    className="h-full min-h-[200px] resize-none bg-muted/20 border-dashed focus:border-solid transition-all"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <StickyFooter>
                        <Button onClick={() => setCurrentStep('profit')} variant="outline" className="flex-1 md:flex-none"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                        <Button onClick={handleSaveJob} disabled={isSubmitting} className="flex-1 md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                            Save Job
                        </Button>
                    </StickyFooter>
                </div>
            )}
        </div>
    );
}
