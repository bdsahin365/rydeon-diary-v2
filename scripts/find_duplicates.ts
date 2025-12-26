import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing');
    process.exit(1);
}

async function findDuplicates() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected to DB');

        const collection = mongoose.connection.collection('my_jobs');

        const pipeline = [
            {
                $group: {
                    _id: {
                        bookingDate: "$bookingDate",
                        bookingTime: "$bookingTime",
                        pickup: "$pickup",
                        dropoff: "$dropoff",
                        customerName: "$customerName"
                        // Intentionally excluding 'status' unless you think duplicates might have different statuses
                    },
                    count: { $sum: 1 },
                    docIds: { $push: "$_id" },
                    jobs: { $push: "$$ROOT" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 },
                    "_id.bookingDate": { $exists: true, $ne: null },
                    "_id.pickup": { $exists: true, $ne: null }
                }
            }
        ];

        const duplicates = await collection.aggregate(pipeline).toArray();

        let report = '';
        if (duplicates.length === 0) {
            report = 'No duplicates found.';
            console.log(report);
        } else {
            report += `Found ${duplicates.length} sets of duplicates:\n`;
            duplicates.forEach((group, index) => {
                report += `\nDuplicate Set #${index + 1}:\n`;
                report += `Criteria: ${JSON.stringify(group._id, null, 2)}\n`;
                report += 'Job Details:\n';
                group.jobs.forEach((job: any) => {
                    report += `  - ID: ${job._id} | Ref: ${job.jobRef} | Status: ${job.status} | CreatedAt: ${job.createdAt}\n`;
                });
            });
            console.log(report);
        }

        fs.writeFileSync('duplicates_report.txt', report);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

findDuplicates();
