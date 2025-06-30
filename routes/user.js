// routes/user.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authController = require('../controllers/authController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// GET /api/users - View all users (admin only)
router.get('/', verifyToken, restrictTo('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        base: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/register', verifyToken, restrictTo('ADMIN'), authController.register);


module.exports = router;
