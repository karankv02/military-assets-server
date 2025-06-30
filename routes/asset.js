// routes/asset.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const assetController = require('../controllers/assetController');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

/**
 * GET /api/assets
 * All logged-in users can access
 * - ADMIN and LOGISTICS_OFFICER see all assets
 * - BASE_COMMANDER sees only assets at their base
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userBaseId = req.user.baseId;

    let assets;

    if (userRole === 'BASE_COMMANDER') {
      // Limit to their own base
      assets = await prisma.asset.findMany({
        where: {
          baseId: userBaseId,
        },
      });
    } else {
      // Admin or Logistics Officer can view all
      assets = await prisma.asset.findMany();
    }

    res.json(assets);
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

/**
 * POST /api/assets
 * Only ADMIN and LOGISTICS_OFFICER can create assets
 */
router.post('/', verifyToken, restrictTo('ADMIN', 'LOGISTICS_OFFICER'), async (req, res) => {
  const { name, type, quantity, purchaseDate, baseId } = req.body;

  if (!name || !type || !quantity || !purchaseDate || !baseId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newAsset = await prisma.asset.create({
      data: {
        name,
        type,
        quantity: parseInt(quantity),
        purchaseDate: new Date(purchaseDate),
        baseId: parseInt(baseId),
      },
    });

    res.status(201).json(newAsset);
  } catch (err) {
    console.error('Error creating asset:', err);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Edit asset by ID
router.put('/:id', verifyToken, restrictTo('ADMIN', 'LOGISTICS_OFFICER'), async (req, res) => {
  const assetId = Number(req.params.id);
  const { name, type, quantity, purchaseDate, baseId } = req.body;

  if (!name || !type || !quantity || !purchaseDate || !baseId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        name,
        type,
        quantity: parseInt(quantity),
        purchaseDate: new Date(purchaseDate),
        baseId: parseInt(baseId),
      },
    });
    res.json(updatedAsset);
  } catch (err) {
    console.error('Error updating asset:', err);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// Delete asset by ID
router.delete('/:id', verifyToken, restrictTo('ADMIN', 'LOGISTICS_OFFICER'), async (req, res) => {
  const assetId = Number(req.params.id);

  try {
    await prisma.asset.delete({
      where: { id: assetId }
    });
    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('Error deleting asset:', err);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});


/**
 * PUT /api/assets/transfer
 * Allowed Roles: ADMIN, LOGISTICS_OFFICER, BASE_COMMANDER
 */

module.exports = router;
