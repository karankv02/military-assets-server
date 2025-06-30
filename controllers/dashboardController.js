// controllers/dashboardController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardMetrics = async (req, res) => {
  try {
    const [
      assetSum,
      purchaseSum,
      transferInSum,
      transferOutSum,
      assignmentSum,
      expenditureSum
    ] = await Promise.all([
      prisma.asset.aggregate({ _sum: { quantity: true } }),
      prisma.purchase.aggregate({ _sum: { quantity: true } }),
      prisma.transfer.aggregate({ _sum: { quantity: true } }), // Transfers In (simplified)
      prisma.transfer.aggregate({ _sum: { quantity: true } }), // Transfers Out (simplified)
      prisma.assignment.aggregate({ _sum: { quantity: true } }),
      prisma.expenditure.aggregate({ _sum: { quantity: true } }),
    ]);

    const totalAssets = assetSum._sum.quantity || 0;
    const purchased = purchaseSum._sum.quantity || 0;
    const transferredIn = transferInSum._sum.quantity || 0;
    const transferredOut = transferOutSum._sum.quantity || 0;
    const assigned = assignmentSum._sum.quantity || 0;
    const expended = expenditureSum._sum.quantity || 0;

    const openingBalance = totalAssets + expended; // assume assets before deductions
    const closingBalance = totalAssets;
    const netMovement = purchased + transferredIn - transferredOut;

    res.json({
      openingBalance,
      closingBalance,
      netMovement,
      assigned,
      expended
    });
  } catch (err) {
    console.error('❌ Error in getDashboardMetrics:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};


// Total assets count
exports.getTotalAssets = async (req, res) => {
  try {
    const count = await prisma.asset.count();
    res.json({ totalAssets: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching total assets' });
  }
};

// Assets grouped by base
exports.getAssetsByBase = async (req, res) => {
  try {
    const data = await prisma.asset.groupBy({
      by: ['baseId'],
      _count: { _all: true },
    });

    const bases = await prisma.base.findMany();

    const response = data.map(d => {
      const base = bases.find(b => b.id === d.baseId);
      return {
        baseId: d.baseId,
        baseName: base?.name || 'Unknown',
        assetCount: d._count._all,
      };
    });

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching assets by base' });
  }
};

// Assets grouped by type
exports.getAssetsByType = async (req, res) => {
  try {
    const data = await prisma.asset.groupBy({
      by: ['type'],
      _count: { _all: true },
    });

    res.json(data.map(d => ({
      type: d.type,
      count: d._count._all,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching assets by type' });
  }
};
