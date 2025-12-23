const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing');
    process.exit(1);
}

async function checkOperators() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const collection = mongoose.connection.collection('operators');
        const operators = await collection.find({}).toArray();

        console.log(`Found ${operators.length} operators:`);
        operators.forEach(op => {
            console.log(`- Name: ${op.name}, ID: ${op._id}, UserID: ${op.userId}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkOperators();
