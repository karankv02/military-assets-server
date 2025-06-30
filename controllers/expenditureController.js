const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getExpenditures = async (req, res) => {
  const { role, baseId } = req.user;

  try {
    const whereClause = role === 'ADMIN' ? {} : { baseId };

    const expenditures = await prisma.expenditure.findMany({
      where: whereClause,
      include: {
        asset: true,
        base: true,
      },
      orderBy: { recordedAt: 'desc' },
    });

    res.json(expenditures);
  } catch (err) {
    console.error('Expenditure fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch expenditures' });
  }
};

exports.createExpenditure = async (req, res) => {
  try {
    const { role, baseId: userBaseId } = req.user;
    const { assetId, baseId, quantity, reason } = req.body;

    const parsedAssetId = parseInt(assetId);
    const parsedBaseId = role === 'ADMIN' ? parseInt(baseId) : parseInt(userBaseId);
    const parsedQuantity = parseInt(quantity);

    if (!parsedAssetId || !parsedBaseId || !parsedQuantity || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const expenditure = await prisma.expenditure.create({
      data: {
        assetId: parsedAssetId,
        baseId: parsedBaseId,
        quantity: parsedQuantity,
        reason,
      },
    });

    res.status(201).json(expenditure);
  } catch (err) {
    console.error('Expenditure creation error:', err);
    res.status(500).json({ error: 'Failed to record expenditure' });
  }
};
