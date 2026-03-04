const mongoose = require('mongoose');
require('dotenv').config();

const EventSchema = new mongoose.Schema({
    eventId: String,
    name: String
}, { strict: false });

const Event = mongoose.model('Event', EventSchema);

async function checkEvents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const events = await Event.find({}, { eventId: 1, name: 1 });
        console.log('Events in DB:', JSON.stringify(events, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkEvents();
