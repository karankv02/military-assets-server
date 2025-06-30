const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

// ✅ Create assignment with quantity
router.post('/', verifyToken, restrictTo('ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'), async (req, res) => {
  const { assetId, assignee, baseId, quantity } = req.body;

  // Convert to numbers safely
  const assetIdNum = Number(assetId);
  const baseIdNum = Number(baseId);
  const qtyNum = Number(quantity);

  if (!assetIdNum || !baseIdNum || !qtyNum || qtyNum <= 0) {
    return res.status(400).json({ error: 'Invalid or missing values in request' });
  }

  try {
    const asset = await prisma.asset.findUnique({ where: { id: assetIdNum } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    if (qtyNum > asset.quantity) {
      return res.status(400).json({ error: 'Not enough asset quantity available' });
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        assetId: assetIdNum,
        assignee,
        baseId: baseIdNum,
        quantity: qtyNum,
      },
    });

    // Deduct quantity from asset
    await prisma.asset.update({
      where: { id: assetIdNum },
      data: { quantity: asset.quantity - qtyNum },
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error('Assignment error:', err);
    res.status(500).json({ error: 'Failed to assign asset' });
  }
});

// ✅ List all assignments (restricted)
router.get('/', verifyToken, restrictTo('ADMIN', 'BASE_COMMANDER'), async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'BASE_COMMANDER') {
      filter.baseId = req.user.baseId;
    }

    const assignments = await prisma.assignment.findMany({
      where: filter,
      include: { asset: true, base: true },
    });

    res.json(assignments);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// ✅ Update assignment
router.put('/:id', verifyToken, restrictTo('ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'), async (req, res) => {
  const assignmentId = parseInt(req.params.id);
  const { assignee, quantity } = req.body;

  if (!assignmentId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid assignment update request' });
  }

  try {
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const asset = await prisma.asset.findUnique({ where: { id: assignment.assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const quantityDiff = quantity - assignment.quantity;

    if (quantityDiff > asset.quantity) {
      return res.status(400).json({ error: 'Insufficient asset quantity for this update' });
    }

    // Update asset stock
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        quantity: asset.quantity - quantityDiff,
      },
    });

    // Update the assignment
    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        assignee,
        quantity,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

module.exports = router;
