const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Global error handlers - prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.get('/api/certificate/:registrationId', require('./utils/certificateGenerator').generateCertificate);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-event';

console.log('--- Database Config ---');
console.log('URI:', MONGO_URI.startsWith('mongodb+srv') ? 'Cloud Atlas Connected (SRV)' : 'Local/Other Connection');
if (!process.env.MONGO_URI) {
    console.warn('WARNING: process.env.MONGO_URI is undefined. Using local fallback.');
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch(err => {
        console.error('CRITICAL: MongoDB connection error!');
        console.error('Error Details:', err.message);
        if (err.message.includes('whitelist')) {
            console.error('ADVICE: Check your IP Whitelist in MongoDB Atlas.');
        }
    });

app.get('/', (req, res) => {
    res.send('Smart Event Management API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
