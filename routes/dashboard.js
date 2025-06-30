// routes/dashboard.js

const express = require('express');
const router = express.Router();
const {
  getTotalAssets,
  getAssetsByBase,
  getAssetsByType,
} = require('../controllers/dashboardController');

const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

// All dashboard routes protected
router.get('/total-assets', verifyToken, getTotalAssets);
router.get('/assets-by-base', verifyToken, getAssetsByBase);
router.get('/assets-by-type', verifyToken, getAssetsByType);

router.get('/recent-activity', verifyToken, async (req, res) => {
  try {
    const [recentAssets, recentTransfers, recentAssignments, recentPurchases] = await Promise.all([
      prisma.asset.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.transfer.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.assignment.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.purchase.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    res.json({
      assets: recentAssets,
      transfers: recentTransfers,
      assignments: recentAssignments,
      purchases: recentPurchases,
    });
  } catch (err) {
    console.error('Recent activity error:', err);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});


module.exports = router;
