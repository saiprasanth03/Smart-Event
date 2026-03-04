const Event = require('../models/Event');
const Registration = require('../models/Registration');

const getAdminAnalytics = async (req, res) => {
    try {
        const { type, eventId } = req.query;
        let eventQuery = {};
        if (eventId) {
            eventQuery._id = eventId;
        } else if (type && type !== 'All') {
            eventQuery.type = type;
        }

        const events = await Event.find(eventQuery);
        const eventIds = events.map(e => e._id);

        const totalEvents = events.length;
        const totalParticipants = await Registration.countDocuments({ event: { $in: eventIds } });
        const attendedCount = await Registration.countDocuments({ event: { $in: eventIds }, attendanceStatus: { $ne: 'Registered' } });
        const foodRedeemed = await Registration.countDocuments({ event: { $in: eventIds }, foodRedeemed: true });

        const attendanceRate = totalParticipants > 0 ? (attendedCount / totalParticipants) * 100 : 0;

        // Get average feedback
        const feedbackStats = await Registration.aggregate([
            { $match: { event: { $in: eventIds }, 'feedback.rating': { $exists: true } } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$feedback.rating' },
                    totalFeedback: { $sum: 1 },
                    positive: { $sum: { $cond: [{ $gte: ['$feedback.rating', 4] }, 1, 0] } },
                    neutral: { $sum: { $cond: [{ $eq: ['$feedback.rating', 3] }, 1, 0] } },
                    negative: { $sum: { $cond: [{ $lt: ['$feedback.rating', 3] }, 1, 0] } }
                }
            }
        ]);

        const latestFeedback = await Registration.find({ event: { $in: eventIds }, 'feedback.rating': { $exists: true } })
            .sort({ 'feedback.submittedAt': -1 })
            .limit(5)
            .populate('user event', 'name');

        let foodItemCounts = {};
        let attendedMembersList = [];

        if (eventId) {
            const registrations = await Registration.find({ event: eventId, attendanceStatus: { $ne: 'Registered' } }).populate('user');

            registrations.forEach(r => {
                attendedMembersList.push({
                    name: r.user ? r.user.name : 'Unknown',
                    foodPreference: r.foodPreference || 'Veg',
                    selectedMenuItems: r.selectedMenuItems || []
                });

                (r.selectedMenuItems || []).forEach(item => {
                    foodItemCounts[item] = (foodItemCounts[item] || 0) + 1;
                });

                if (r.teamMembers && r.teamMembers.length > 0) {
                    r.teamMembers.forEach(m => {
                        attendedMembersList.push({
                            name: m.name,
                            foodPreference: m.foodPreference || 'Veg',
                            selectedMenuItems: m.selectedMenuItems || []
                        });
                        (m.selectedMenuItems || []).forEach(item => {
                            foodItemCounts[item] = (foodItemCounts[item] || 0) + 1;
                        });
                    });
                }
            });
        }

        const stats = {
            totalEvents,
            totalParticipants,
            attendedCount,
            foodRedeemed,
            attendanceRate: attendanceRate.toFixed(2),
            avgRating: feedbackStats.length > 0 ? feedbackStats[0].avgRating.toFixed(1) : 0,
            totalFeedback: feedbackStats.length > 0 ? feedbackStats[0].totalFeedback : 0,
            sentiment: feedbackStats.length > 0 ? {
                positive: feedbackStats[0].positive,
                neutral: feedbackStats[0].neutral,
                negative: feedbackStats[0].negative
            } : { positive: 0, neutral: 0, negative: 0 },
            attendedMembersList,
            foodItemCounts,
            latestFeedback: latestFeedback.map(f => ({
                userName: f.user.name,
                eventName: f.event.name,
                rating: f.feedback.rating,
                comment: f.feedback.comment,
                date: f.feedback.submittedAt
            }))
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const exportAnalyticsCsv = async (req, res) => {
    try {
        const { eventId } = req.query;
        const query = eventId ? { event: eventId } : {};
        const registrations = await Registration.find(query).populate('event user');
        let csv = 'User Name,Email,Event Name,Type,Ticket ID,Attendance Status,Food Redeemed,Award,Team Name,Team Size,Feedback Rating,Food Preferences\n';

        registrations.forEach(r => {
            const userName = r.user ? r.user.name.replace(/,/g, '') : 'Unknown';
            const email = r.user ? r.user.email : 'Unknown';
            const eventName = r.event ? r.event.name.replace(/,/g, '') : 'Unknown';
            const type = r.event ? r.event.type : 'Unknown';
            const rating = r.feedback && r.feedback.rating ? r.feedback.rating : 'N/A';

            let foodPrefs = '';
            if (r.teamMembers && r.teamMembers.length > 0) {
                const prefs = [`Leader: ${r.foodPreference || 'Veg'} [${(r.selectedMenuItems || []).join('+')}]`];
                r.teamMembers.forEach(m => prefs.push(`${m.name.replace(/,/g, '')}: ${m.foodPreference || 'Veg'} [${(m.selectedMenuItems || []).join('+')}]`));
                foodPrefs = prefs.join(' | ');
            } else {
                foodPrefs = `${r.foodPreference || 'Veg'} [${(r.selectedMenuItems || []).join('+')}]`;
            }

            csv += `"${userName}","${email}","${eventName}","${type}","${r.ticketId}","${r.attendanceStatus}","${r.foodRedeemed}","${r.award || 'None'}","${r.teamName || ''}","${r.teamSize}","${rating}","${foodPrefs}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('analytics_export.csv');
        return res.send(csv);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { getAdminAnalytics, exportAnalyticsCsv };
