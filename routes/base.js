// routes/base.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

/**
 * GET /api/bases
 * Allowed Roles: ADMIN, BASE_COMMANDER
 */
router.get('/', verifyToken, restrictTo('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), async (req, res) => {
  try {
    // Optional: if role is BASE_COMMANDER, show only their base
    if (req.user.role === 'BASE_COMMANDER') {
      const commanderBase = await prisma.base.findUnique({
        where: { id: req.user.baseId },
      });

      if (!commanderBase) {
        return res.status(404).json({ error: 'Base not found for this commander' });
      }

      return res.json([commanderBase]); // Return as array for frontend compatibility
    }

    // ADMIN can view all bases
    const bases = await prisma.base.findMany();
    res.json(bases);
  } catch (err) {
    console.error('Error fetching bases:', err);
    res.status(500).json({ error: 'Failed to fetch bases' });
  }
});

/**
 * POST /api/bases
 * Allowed Roles: ADMIN
 */
router.post('/', verifyToken, restrictTo('ADMIN'), async (req, res) => {
  const { name, location } = req.body;

  if (!name || !location) {
    return res.status(400).json({ error: 'Name and location are required' });
  }

  try {
    const newBase = await prisma.base.create({
      data: {
        name,
        location,
      },
    });

    res.status(201).json(newBase);
  } catch (err) {
    console.error('Error creating base:', err);
    res.status(500).json({ error: 'Failed to create base' });
  }
});

// Edit base by ID
router.put('/:id', verifyToken, restrictTo('ADMIN'), async (req, res) => {
  const baseId = Number(req.params.id);
  const { name, location } = req.body;

  if (!name || !location) {
    return res.status(400).json({ error: 'Name and location are required' });
  }

  try {
    const updatedBase = await prisma.base.update({
      where: { id: baseId },
      data: { name, location },
    });
    res.json(updatedBase);
  } catch (err) {
    console.error('Error updating base:', err);
    res.status(500).json({ error: 'Failed to update base' });
  }
});

// Delete base by ID
router.delete('/:id', verifyToken, restrictTo('ADMIN'), async (req, res) => {
  const baseId = Number(req.params.id);

  try {
    await prisma.$transaction([
      // Delete transfers where this base is sender or receiver
      prisma.transfer.deleteMany({
        where: {
          OR: [
            { fromBaseId: baseId },
            { toBaseId: baseId }
          ]
        }
      }),

      // Delete assignments linked to this base
      prisma.assignment.deleteMany({
        where: {
          baseId: baseId
        }
      }),

      // Delete purchases linked to this base
      prisma.purchase.deleteMany({
        where: {
          baseId: baseId
        }
      }),

      // Delete assets belonging to this base
      prisma.asset.deleteMany({
        where: {
          baseId: baseId
        }
      }),

      // Finally delete the base
      prisma.base.delete({
        where: { id: baseId }
      })
    ]);

    res.json({ message: 'Base and related data deleted successfully' });

  } catch (err) {
    console.error('Error deleting base and its related data:', err);
    res.status(500).json({ error: 'Failed to delete base and its dependencies' });
  }
});



module.exports = router;
