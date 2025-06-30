// controllers/assignmentController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// PUT /api/assignments/:id
exports.updateAssignment = async (req, res) => {
  const assignmentId = parseInt(req.params.id);
  const { assignee, quantity } = req.body;

  try {
    // Fetch the original assignment and asset
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const asset = await prisma.asset.findUnique({ where: { id: assignment.assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const quantityDiff = quantity - assignment.quantity;

    // Check if asset has enough quantity for the update
    if (asset.quantity < quantityDiff) {
      return res.status(400).json({ error: 'Insufficient asset quantity for update' });
    }

    // Update asset quantity
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        quantity: asset.quantity - quantityDiff,
      },
    });

    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        assignee,
        quantity,
      },
    });

    res.json(updatedAssignment);
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};
