const express = require('express');
const { registerForEvent, verifyAttendance, redeemFoodToken, submitFeedback, getMyRegistrations, getDynamicQR, updateFoodPreference, assignAward, getEventRegistrations } = require('../controllers/registrationController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/register', authMiddleware, registerForEvent);
router.get('/my-registrations', authMiddleware, getMyRegistrations);
router.put('/update-food', authMiddleware, updateFoodPreference);
router.post('/verify-attendance', authMiddleware, verifyAttendance); // Can be user (location) or admin (QR)
router.post('/redeem-food', authMiddleware, redeemFoodToken);
router.post('/feedback', authMiddleware, submitFeedback);
router.get('/dynamic-qr/:eventId', authMiddleware, adminMiddleware, getDynamicQR);
router.get('/dynamic-qr/:eventId', authMiddleware, adminMiddleware, getDynamicQR);
router.post('/assign-award', authMiddleware, adminMiddleware, assignAward);
router.get('/event-registrations/:eventId', authMiddleware, adminMiddleware, getEventRegistrations);

const { generateCertificate, generateTeamCertificates } = require('../utils/certificateGenerator');
router.get('/download-certificate/:registrationId', authMiddleware, generateCertificate);
router.get('/download-team-certificates/:registrationId', authMiddleware, generateTeamCertificates);

module.exports = router;
