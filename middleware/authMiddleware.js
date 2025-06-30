const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

// 1. Verify JWT and fetch user info
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      baseId: user.baseId, // required for BASE_COMMANDER, LOGISTICS_OFFICER
    };

    next();
  } catch (err) {
    console.error('JWT Error:', err);
    return res.status(403).json({ error: 'Token invalid or expired' });
  }
};

// 2. Restrict by role
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied: insufficient role' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  restrictTo,
};
