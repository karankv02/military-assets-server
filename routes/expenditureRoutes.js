const express = require('express');
const router = express.Router();
const expenditureController = require('../controllers/expenditureController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.post('/', expenditureController.createExpenditure);
router.get('/',  expenditureController.getExpenditures);

module.exports = router;
