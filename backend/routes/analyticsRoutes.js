const express = require('express');
const { getAdminAnalytics, exportAnalyticsCsv } = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getAdminAnalytics);
router.get('/export', authMiddleware, adminMiddleware, exportAnalyticsCsv);

module.exports = router;
