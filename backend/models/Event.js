const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['Hackathon', 'Workshop', 'Guest Lecture', 'Seminar', 'Technical Event', 'Cultural Event'],
        required: true
    },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true },
    maxParticipants: { type: Number, required: true },
    foodAvailable: { type: Boolean, default: false },
    vegAllowable: { type: Boolean, default: true },
    nonVegAllowable: { type: Boolean, default: false },
    availableMenuItems: [{ type: String }],
    foodSelectionActive: { type: Boolean, default: false },
    certificateAvailable: { type: Boolean, default: false },
    feedbackAvailable: { type: Boolean, default: false },
    attendanceActive: { type: Boolean, default: true },
    isTeamEvent: { type: Boolean, default: false },
    maxTeamSize: { type: Number, default: 1 },
    maxTeams: { type: Number, default: 0 }, // 0 means unlimited or limited by maxParticipants
    eventId: { type: String, unique: true, required: true, index: true },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    allowedRegion: [[Number]], // Array of [lat, lng] pairs
    qrCode: { type: String }, // Store base64 or path to image
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hodSignature: { type: String, default: '' },
    principalSignature: { type: String, default: '' },
    vicePrincipalSignature: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
