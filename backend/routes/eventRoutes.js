const express = require('express');
const { createEvent, getEvents, getEventById, deleteEvent, updateEvent, toggleCertificates, toggleFeedback, toggleAttendance } = require('../controllers/eventController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, createEvent);
router.get('/', getEvents);
router.get('/:eventId', getEventById);
router.put('/:eventId', authMiddleware, adminMiddleware, updateEvent);
router.delete('/:eventId', authMiddleware, adminMiddleware, deleteEvent);
router.patch('/:eventId/toggle-certificates', authMiddleware, adminMiddleware, toggleCertificates);
router.patch('/:eventId/toggle-feedback', authMiddleware, adminMiddleware, toggleFeedback);
router.patch('/:eventId/toggle-attendance', authMiddleware, adminMiddleware, toggleAttendance);

module.exports = router;
