const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, transferController.createTransfer);
router.get('/', verifyToken, transferController.getTransfers);

module.exports = router;
