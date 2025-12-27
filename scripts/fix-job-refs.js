const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Define Job Schema (simplified for this script)
const JobSchema = new mongoose.Schema({
    jobRef: { type: String },
    bookingDate: { type: String },
    userId: { type: String, required: true },
    status: { type: String },
}, { strict: false });

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema, 'my_jobs');

async function fixJobRefs() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const jobs = await Job.find({
            $or: [{ jobRef: { $exists: false } }, { jobRef: "" }, { jobRef: null }]
        }).sort({ bookingDate: 1, createdAt: 1 });

        console.log(`Found ${jobs.length} jobs missing Job Ref`);

        // Group jobs by date to maintain index correctly
        const jobsByDate = {}; // Key: "DD/MM/YYYY"

        // First pass: organize jobs
        for (const job of jobs) {
            let bookingDate = job.bookingDate;
            if (!bookingDate) continue;

            // Normalize date to DD/MM/YYYY
            if (bookingDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [y, m, d] = bookingDate.split('-');
                bookingDate = `${d}/${m}/${y}`;
            }

            // Simple validation
            if (!bookingDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                continue;
            }

            // We iterate by date globally to avoid race conditions if multiple users? 
            // No, we should group by user if we want per-user sequencing. 
            // But if index is unique globally, we must check globally.
            // Let's stick to per-user grouping, but check globally for collision if necessary.
            // Actually, let's just use the robust "try/catch/retry" approach for simplicity.

            const key = bookingDate; // Group by date only to handle the index generation

            if (!jobsByDate[key]) {
                jobsByDate[key] = [];
            }
            jobsByDate[key].push(job);
        }

        // Second pass: generate IDs and update
        for (const [date, dateJobs] of Object.entries(jobsByDate)) {
            const [day, month, year] = date.split('/');
            const dateStr = `${day}${month}${year}`;

            // Sort jobs by createdAt to be deterministic
            dateJobs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

            for (let i = 0; i < dateJobs.length; i++) {
                const job = dateJobs[i];
                let saved = false;
                let attempts = 0;

                // Try to find a free slot
                while (!saved && attempts < 50) {
                    // Calculate start index dynamically every time
                    // We look for the highest index currently in DB for this date prefix
                    const regex = new RegExp(`^RYDE${dateStr}-(\\d+)$`);
                    // We must find GLOBALLY to satisfy unique constraint
                    const highestJob = await Job.findOne({ jobRef: { $regex: regex } }).sort({ jobRef: -1 });

                    let nextIndex = 1;
                    if (highestJob && highestJob.jobRef) {
                        const match = highestJob.jobRef.match(regex);
                        if (match && match[1]) {
                            nextIndex = parseInt(match[1]) + 1;
                        }
                    }

                    // If we are in a loop (collision during race), increment manually
                    if (attempts > 0) nextIndex += attempts;

                    const jobRef = `RYDE${dateStr}-${nextIndex}`;

                    try {
                        await Job.updateOne(
                            { _id: job._id },
                            { $set: { jobRef } }
                        );
                        console.log(`Updated job ${job._id} -> ${jobRef}`);
                        saved = true;
                    } catch (e) {
                        if (e.code === 11000) {
                            console.log(`Collision for ${jobRef}, retrying...`);
                            attempts++;
                        } else {
                            console.error(`Error updating job ${job._id}:`, e);
                            break;
                        }
                    }
                }
            }
        }

        console.log('Finished updating job references.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixJobRefs();
