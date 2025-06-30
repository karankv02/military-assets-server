const express = require('express');
const router = express.Router();
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');
const purchaseController = require('../controllers/purchaseController');

// GET all purchases
router.get('/', verifyToken, purchaseController.getAllPurchases);

// POST a new purchase
router.post('/', verifyToken, restrictTo('ADMIN', 'LOGISTICS_OFFICER'), purchaseController.createPurchase);

module.exports = router;
