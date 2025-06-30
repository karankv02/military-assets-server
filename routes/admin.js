// routes/admin.js

const express = require('express');
const router = express.Router();
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.get('/admin-only', verifyToken, restrictTo('ADMIN'), (req, res) => {
  res.send('Welcome Admin! Only you can see this.');
});

module.exports = router;
