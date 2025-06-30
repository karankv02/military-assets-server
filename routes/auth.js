// routes/auth.js

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// routes/auth.js
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});


module.exports = router;
