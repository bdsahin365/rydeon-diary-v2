import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
    jobRef?: string;
    originalFirebaseId?: string;
    bookingDate?: string;
    bookingTime?: string;
    pickup: string;
    dropoff: string;
    vehicle: string;
    price?: string | number;
    fare?: number;
    originalFare?: number;
    distance: string;
    duration?: string;
    notes?: string;
    operator?: string;
    customerName?: string;
    customerPhone?: string;
    paymentStatus?: string;
    paymentDueDate?: string;
    flightNumber?: string;
    status: string;
    profit?: number;
    isPaid?: boolean;
    name?: string;
    date?: string;
    userId: string;
    timeOfDay?: 'midnight' | 'day' | 'evening';
    noShowWaitTime?: number;
    noShowAt?: Date | string;
    cancellationReason?: string;
    cancelledAt?: Date | string;
    expenses?: Array<{
        type: string;
        amount: number;
        paidByDriver: boolean;
        refundStatus: string;
        description?: string;
    }>;
}

const JobSchema: Schema = new Schema({
    jobRef: { type: String, unique: true, sparse: true },
    originalFirebaseId: { type: String },
    bookingDate: { type: String },
    bookingTime: { type: String },
    pickup: { type: String },
    dropoff: { type: String },
    vehicle: { type: String },
    price: { type: Schema.Types.Mixed },
    fare: { type: Number },
    originalFare: { type: Number },
    distance: { type: String },
    duration: { type: String },
    notes: { type: String },
    operator: { type: String },
    customerName: { type: String },
    customerPhone: { type: String },
    paymentStatus: { type: String, index: true },
    paymentDueDate: { type: String },
    flightNumber: { type: String },
    status: { type: String, default: 'scheduled' },
    profit: { type: Number },
    isPaid: { type: Boolean },
    name: { type: String }, // Legacy
    date: { type: String }, // Legacy
    userId: { type: String, required: true, index: true },
    timeOfDay: { type: String, enum: ['midnight', 'day', 'evening'], index: true },
    noShowWaitTime: { type: Number },
    noShowAt: { type: Date },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    expenses: [{
        type: { type: String },
        amount: { type: Number },
        paidByDriver: { type: Boolean },
        refundStatus: { type: String },
        description: { type: String }
    }]
}, {
    timestamps: true,
    collection: 'my_jobs',
    strict: false
});

// Prevent Mongoose OverwriteModelError by checking if the model exists
// and deleting it if we are in development to allow schema changes to propagate.
if (process.env.NODE_ENV === 'development' && mongoose.models.Job) {
    delete mongoose.models.Job;
}

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
