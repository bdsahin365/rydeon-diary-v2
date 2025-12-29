export interface PassengerDetails {
    adults: number;
    children: number;
    infants: number;
}

export interface LuggageDetails {
    cabin: number;
    checked: number;
}

export interface ChildSeatDetails {
    infant: number;
    child: number;
    booster: number;
}

export interface Expense {
    type: 'Parking' | 'Other';
    amount: number;
    paidByDriver: boolean;
    refundStatus: 'Pending' | 'Refunded by Operator' | 'Refunded by VIP' | 'Non-refundable';
    description?: string;
}

export interface PaymentHistoryEntry {
    status: string;
    date: string;
    notes?: string;
}

export type JobStatus = 'scheduled' | 'completed' | 'cancelled' | 'archived';
export type PaymentStatus = 'unpaid' | 'paid' | 'payment-scheduled' | 'overdue' | 'cancelled';

export interface MyJob {
    _id?: string;
    id?: string;
    pickup?: string;
    dropoff?: string;
    vias?: string[];
    fare?: number;
    originalFare?: number;
    price?: string | number; // Legacy or string input
    parsedPrice?: number;
    operator?: string;
    operatorFee?: number;
    airportFee?: number;
    includeAirportFee?: boolean;
    customerName?: string;
    customerPhone?: string;
    status?: JobStatus;
    paymentStatus?: PaymentStatus;
    paymentDueDate?: string | null;
    paymentHistory?: PaymentHistoryEntry[];
    flightNumber?: string;
    passengers?: PassengerDetails;
    luggage?: LuggageDetails;
    childSeat?: ChildSeatDetails;
    vehicle?: string;
    distance?: string;
    duration?: string;
    notes?: string;
    bookingDate?: string | Date;
    bookingTime?: string;
    parsedBookingDate?: Date;
    bookedAt?: string;
    userId?: string;
    myJobId?: string;
    originalJobId?: string;
    profit?: number;
    pickupPoint?: { lat: number; lng: number };
    dropoffPoint?: { lat: number; lng: number };
    jobRef?: string;
    noShowWaitTime?: number;
    noShowAt?: Date | string;
    expenses?: Expense[];
}

export interface Operator {
    _id?: string;
    id?: string;
    name: string;
    chargesCommission: boolean;
    commissionRate?: number;
    paymentCycle?: string;
    logo?: string;
}

export interface ProcessedJob extends MyJob {
    postedAt?: Date;
}
