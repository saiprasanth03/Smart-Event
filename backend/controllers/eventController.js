const Event = require('../models/Event');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid'); // Need to install uuid

const createEvent = async (req, res) => {
    try {
        const { name, type, description, date, startTime, endTime, location, maxParticipants, foodAvailable, vegAllowable, nonVegAllowable, availableMenuItems, certificateAvailable, coordinates, isTeamEvent, maxTeamSize, maxTeams, allowedRegion, hodSignature, principalSignature, vicePrincipalSignature } = req.body;
        const eventId = uuidv4().split('-')[0].toUpperCase(); // Simple unique ID

        // Generate QR Code for Registration (URL to the event page)
        const qrData = JSON.stringify({ eventId, type: 'registration' });
        const qrCode = await QRCode.toDataURL(qrData);

        const event = new Event({
            name, type, description, date, startTime, endTime, location, maxParticipants,
            foodAvailable, vegAllowable, nonVegAllowable, availableMenuItems, certificateAvailable, eventId, qrCode, coordinates,
            isTeamEvent, maxTeamSize, maxTeams, allowedRegion,
            hodSignature, principalSignature, vicePrincipalSignature,
            createdBy: req.user.id
        });

        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const updates = req.body;

        const event = await Event.findOne({ eventId });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (req.user.role !== 'Admin' || event.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized. You did not create this event.' });
        }

        const updatedEvent = await Event.findOneAndUpdate({ eventId }, updates, { new: true });
        res.json(updatedEvent);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('createdBy', 'name');
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findOne({ eventId: req.params.eventId });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findOne({ eventId: req.params.eventId });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (req.user.role !== 'Admin' || event.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized. You did not create this event.' });
        }

        await Event.deleteOne({ eventId: req.params.eventId });
        // Optionally delete registrations too
        const Registration = require('../models/Registration');
        await Registration.deleteMany({ event: event._id });

        res.json({ message: 'Event and associated registrations deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const toggleCertificates = async (req, res) => {
    try {
        const event = await Event.findOne({ eventId: req.params.eventId });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (req.user.role !== 'Admin' || event.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        event.certificateAvailable = !event.certificateAvailable;
        await event.save();
        res.json({ message: `Certificates ${event.certificateAvailable ? 'enabled' : 'disabled'}`, event });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const toggleFeedback = async (req, res) => {
    try {
        const event = await Event.findOne({ eventId: req.params.eventId });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (req.user.role !== 'Admin' || event.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        event.feedbackAvailable = !event.feedbackAvailable;
        await event.save();
        res.json({ message: `Feedback ${event.feedbackAvailable ? 'enabled' : 'disabled'}`, event });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const toggleAttendance = async (req, res) => {
    try {
        const event = await Event.findOne({ eventId: req.params.eventId });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (req.user.role !== 'Admin' || event.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        event.attendanceActive = !event.attendanceActive;
        await event.save();
        res.json({ message: `Attendance ${event.attendanceActive ? 'enabled' : 'disabled'}`, event });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { createEvent, getEvents, getEventById, deleteEvent, updateEvent, toggleCertificates, toggleFeedback, toggleAttendance };
