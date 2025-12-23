const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing');
    process.exit(1);
}

async function mergeOperators() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const collection = mongoose.connection.collection('operators');
        const operators = await collection.find({}).toArray();

        console.log(`Found ${operators.length} total operators.`);

        // Group by normalized name
        const grouped = {};
        operators.forEach(op => {
            const name = op.name.trim(); // Case sensitive for now, as shown in previous output names were identical
            if (!grouped[name]) {
                grouped[name] = [];
            }
            grouped[name].push(op);
        });

        let deletedCount = 0;

        for (const name in grouped) {
            const group = grouped[name];
            if (group.length > 1) {
                console.log(`Found ${group.length} duplicates for "${name}"`);

                // Sort by creation time (if available) or ID to keep the oldest/newest
                // Let's keep the one with the most fields populated or just the first one
                // Simple strategy: Keep the first one, delete the rest.

                const [keep, ...remove] = group;
                const removeIds = remove.map(op => op._id);

                console.log(`Keeping ID: ${keep._id}, Removing IDs: ${removeIds.join(', ')}`);

                const result = await collection.deleteMany({ _id: { $in: removeIds } });
                deletedCount += result.deletedCount;
            }
        }

        console.log(`Merge complete. Deleted ${deletedCount} duplicate operators.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

mergeOperators();
