const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('Attempting to connect to MongoDB...');
console.log('URI:', MONGO_URI.replace(/:([^:@]+)@/, ':***@')); // Hide password

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('SUCCESS: MongoDB connected successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: MongoDB connection error:');
        console.error(err);
        process.exit(1);
    });

// Set a timeout
setTimeout(() => {
    console.error('TIMEOUT: Connection attempt timed out after 10 seconds.');
    process.exit(1);
}, 10000);
