// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.get('/metrics', verifyToken, restrictTo('ADMIN'), dashboardController.getDashboardMetrics);

module.exports = router;
