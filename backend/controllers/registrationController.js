const Registration = require('../models/Registration');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const registerForEvent = async (req, res) => {
    try {
        const { eventId, collegeId, teamName, teamSize, teamMembers, foodPreference, selectedMenuItems } = req.body;
        const event = await Event.findOne({ eventId });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // 1. Basic user-event check
        const existingUserReg = await Registration.findOne({ user: req.user.id, event: event._id });
        if (existingUserReg) return res.status(400).json({ message: 'You are already registered for this event.' });

        // 2. College ID - One event at a time check
        // Find all registrations with this collegeId
        const collegeRegs = await Registration.find({ collegeId }).populate('event');

        for (const reg of collegeRegs) {
            const registeredEvent = reg.event;
            if (!registeredEvent) continue; // Protection against orphaned registrations where the event was deleted!

            // Check if it's the same day
            if (new Date(registeredEvent.date).toDateString() === new Date(event.date).toDateString()) {
                // Check for time overlap
                const start1 = registeredEvent.startTime;
                const end1 = registeredEvent.endTime;
                const start2 = event.startTime;
                const end2 = event.endTime;

                // Simple overlap: (StartA < EndB) and (EndA > StartB)
                if (start1 < end2 && end1 > start2) {
                    return res.status(400).json({
                        message: `Collision detected: You are already registered for "${registeredEvent.name}" during this time Slot.`
                    });
                }
            }
        }

        // 3. Team size validation
        if (event.isTeamEvent && !teamSize) {
            return res.status(400).json({ message: 'Team size is required for this event.' });
        }
        if (event.maxTeamSize && teamSize > event.maxTeamSize) {
            return res.status(400).json({ message: `Maximum team size for this event is ${event.maxTeamSize}.` });
        }

        const ticketId = uuidv4();
        const qrData = JSON.stringify({ ticketId, type: 'ticket' });
        const qrTicketImage = await QRCode.toDataURL(qrData);

        const processedTeamMembers = [];
        if (teamMembers && teamMembers.length > 0) {
            for (let i = 0; i < teamMembers.length; i++) {
                const memberToken = uuidv4();
                const memberQrData = JSON.stringify({ ticketId, memberToken, type: 'ticket' }); // same type for simplicity in scanning later
                const memberQrImage = await QRCode.toDataURL(memberQrData);
                processedTeamMembers.push({
                    name: teamMembers[i].name,
                    collegeId: teamMembers[i].collegeId,
                    foodPreference: teamMembers[i].foodPreference || 'Veg',
                    selectedMenuItems: teamMembers[i].selectedMenuItems || [],
                    qrToken: memberToken,
                    qrImage: memberQrImage,
                    foodRedeemed: false
                });
            }
        }

        const registration = new Registration({
            user: req.user.id,
            event: event._id,
            ticketId,
            qrTicket: qrTicketImage,
            collegeId,
            teamName: teamName || '',
            foodPreference: foodPreference || 'Veg',
            selectedMenuItems: selectedMenuItems || [],
            teamSize: teamSize || 1,
            teamMembers: processedTeamMembers
        });

        await registration.save();
        res.status(201).json(registration);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const verifyAttendance = async (req, res) => {
    try {
        const { ticketId, method } = req.body; // method: 'QR', 'Location'

        let registration;
        let event;

        const getDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371e3; // metres
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // in metres
        };

        if (method === 'QR') {
            const { dynamicToken, eventId, userLat, userLng } = req.body;
            if (!dynamicToken || !eventId) return res.status(400).json({ message: 'Dynamic Token and Event ID required' });

            // 1. Validate Token
            const window = Math.floor(Date.now() / 30000);
            const expectedToken = Buffer.from(`${eventId}-${window}-${process.env.JWT_SECRET}`).toString('base64');
            const prevWindowToken = Buffer.from(`${eventId}-${window - 1}-${process.env.JWT_SECRET}`).toString('base64');

            if (dynamicToken !== expectedToken && dynamicToken !== prevWindowToken) {
                return res.status(400).json({ message: 'QR Code expired. Please scan the current one on the admin screen.' });
            }

            event = await Event.findOne({ eventId });
            if (!event) return res.status(404).json({ message: 'Event not found' });

            // 2. Enforce Location if coordinates are set
            if (event.coordinates && typeof event.coordinates.lat === 'number' && typeof event.coordinates.lng === 'number' && event.coordinates.lat !== 0) {
                if (typeof userLat !== 'number' || typeof userLng !== 'number') {
                    return res.status(400).json({ message: 'Location verification required for this event.' });
                }
                const distance = getDistance(userLat, userLng, event.coordinates.lat, event.coordinates.lng);
                if (distance > 1000) {
                    return res.status(400).json({ message: `Security Alert: You must be at the event location to mark attendance. (Distance: ${Math.round(distance)}m)` });
                }
            }

            registration = await Registration.findOne({ user: req.user.id, event: event._id }).populate('event user');
        } else if (method === 'Ticket') {
            const { ticketId } = req.body;
            registration = await Registration.findOne({ ticketId }).populate('event user');
            if (!registration) return res.status(404).json({ message: 'Ticket not found or invalid' });
        } else if (method === 'Location') {
            const { eventId, userLat, userLng } = req.body;
            event = await Event.findOne({ eventId });
            if (!event) return res.status(404).json({ message: 'Event not found' });

            if (event.coordinates && typeof event.coordinates.lat === 'number' && typeof event.coordinates.lng === 'number' && event.coordinates.lat !== 0) {
                const distance = getDistance(userLat, userLng, event.coordinates.lat, event.coordinates.lng);
                if (distance > 1000) {
                    return res.status(400).json({ message: `Too far from event location. Distance: ${Math.round(distance)}m` });
                }
            }
            registration = await Registration.findOne({ user: req.user.id, event: event._id }).populate('event user');
        }
        else if (method === 'Biometric') {
            // Simulated biometric - for demo it always passes if triggered correctly
            const { eventId } = req.body;
            const event = await Event.findOne({ eventId });
            if (!event) return res.status(404).json({ message: 'Event not found' });
            registration = await Registration.findOne({ user: req.user.id, event: event._id }).populate('event user');
        }

        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        if (registration.attendanceStatus !== 'Registered') {
            return res.status(400).json({ message: `Attendance already marked: ${registration.attendanceStatus}` });
        }

        registration.attendanceStatus = 'Attended';
        registration.attendanceTimestamp = new Date();
        await registration.save();

        res.json({
            message: 'Attendance marked successfully',
            registration: {
                id: registration._id,
                userName: registration.user.name,
                eventName: registration.event.name,
                status: registration.attendanceStatus
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const redeemFoodToken = async (req, res) => {
    try {
        const { ticketId, memberToken } = req.body;
        const registration = await Registration.findOne({ ticketId }).populate('event user');

        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        if (!registration.event.foodAvailable) return res.status(400).json({ message: 'No food for this event' });

        // Loosen attendance check: If they are 'Attended' OR 'RedeemedFood', they are verified participants
        if (registration.attendanceStatus !== 'Attended' && registration.attendanceStatus !== 'RedeemedFood') {
            return res.status(400).json({ message: 'Must mark attendance first' });
        }

        let userName = '';

        if (memberToken) {
            // Team member redemption
            const memberIndex = registration.teamMembers.findIndex(m => m.qrToken === memberToken);
            if (memberIndex === -1) return res.status(404).json({ message: 'Invalid team member QR token' });

            if (registration.teamMembers[memberIndex].foodRedeemed) return res.status(400).json({ message: `Food already redeemed for team member: ${registration.teamMembers[memberIndex].name}` });

            registration.teamMembers[memberIndex].foodRedeemed = true;
            userName = registration.teamMembers[memberIndex].name;
            // Also set top-level AttendanceStatus to RedeemedFood to ensure badge logic triggers
            registration.attendanceStatus = 'RedeemedFood';
        } else {
            // Primary user redemption
            if (registration.foodRedeemed) return res.status(400).json({ message: 'Primary food already redeemed' });
            registration.foodRedeemed = true;
            registration.attendanceStatus = 'RedeemedFood';
            userName = registration.user.name;
        }

        await registration.save();

        res.json({
            message: 'Food token redeemed',
            registration: {
                id: registration._id,
                userName: userName,
                eventName: registration.event.name,
                foodRedeemed: true
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const submitFeedback = async (req, res) => {
    try {
        const { rating, comment, eventId } = req.body;
        const registration = await Registration.findOne({ user: req.user.id, event: eventId });

        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        if (registration.attendanceStatus === 'Registered') {
            return res.status(400).json({ message: 'Must attend the event to leave feedback' });
        }

        registration.feedback = { rating, comment, submittedAt: new Date() };
        await registration.save();

        res.json({ message: 'Feedback submitted', registration });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user.id }).populate('event');
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getDynamicQR = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findOne({ eventId });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Generate a token based on eventId and 30-second window
        const window = Math.floor(Date.now() / 30000);
        const dynamicToken = Buffer.from(`${eventId}-${window}-${process.env.JWT_SECRET}`).toString('base64');

        const qrData = JSON.stringify({ eventId, dynamicToken, type: 'attendance' });
        const qrImage = await QRCode.toDataURL(qrData);

        res.json({ qrImage, expiresAt: (window + 1) * 30000 });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateFoodPreference = async (req, res) => {
    try {
        const { ticketId, foodPreference, selectedMenuItems, teamMemberIndex } = req.body;
        const registration = await Registration.findOne({ ticketId });

        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        // Check if user is the owner or admin
        if (registration.user.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (teamMemberIndex !== undefined && teamMemberIndex !== null) {
            if (foodPreference) registration.teamMembers[teamMemberIndex].foodPreference = foodPreference;
            if (selectedMenuItems) registration.teamMembers[teamMemberIndex].selectedMenuItems = selectedMenuItems;
        } else {
            if (foodPreference) registration.foodPreference = foodPreference;
            if (selectedMenuItems) registration.selectedMenuItems = selectedMenuItems;
        }

        await registration.save();
        res.json({ message: 'Food preference updated', registration });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const assignAward = async (req, res) => {
    try {
        const { registrationId, award } = req.body;
        const validAwards = ['None', 'Winners', '1st Runners', '2nd Runners'];
        if (!validAwards.includes(award)) return res.status(400).json({ message: 'Invalid award type' });

        const registration = await Registration.findById(registrationId).populate('event');
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        // Admins can assign if they own the event
        if (req.user.role !== 'Admin' || registration.event.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized. You are not the creator of this event.' });
        }

        registration.award = award;
        await registration.save();
        res.json({ message: `Award ${award} assigned successfully`, registration });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findOne({ eventId });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (req.user.role !== 'Admin' || event.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const registrations = await Registration.find({ event: event._id }).populate('user', 'name email');
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { registerForEvent, verifyAttendance, redeemFoodToken, submitFeedback, getMyRegistrations, getDynamicQR, updateFoodPreference, assignAward, getEventRegistrations };
