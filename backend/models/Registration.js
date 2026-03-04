const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketId: { type: String, required: true, unique: true },
    qrTicket: { type: String, required: true }, // Base64 QR Image
    collegeId: { type: String, required: true },
    foodPreference: { type: String, enum: ['Veg', 'Non-Veg', 'None'], default: 'Veg' },
    selectedMenuItems: [{ type: String }],
    award: { type: String, enum: ['None', 'Winners', '1st Runners', '2nd Runners'], default: 'None' },
    teamName: { type: String, default: '' },
    teamSize: { type: Number, default: 1 },
    teamMembers: [
        {
            name: { type: String, required: true },
            collegeId: { type: String, required: true },
            foodPreference: { type: String, enum: ['Veg', 'Non-Veg', 'None'], default: 'Veg' },
            selectedMenuItems: [{ type: String }],
            qrToken: { type: String },
            qrImage: { type: String },
            foodRedeemed: { type: Boolean, default: false }
        }
    ],
    attendanceStatus: {
        type: String,
        enum: ['Registered', 'Attended', 'RedeemedFood'],
        default: 'Registered'
    },
    attendanceTimestamp: { type: Date },
    foodRedeemed: { type: Boolean, default: false },
    certificateUrl: { type: String },
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        submittedAt: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
