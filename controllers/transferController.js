const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/transfers
exports.createTransfer = async (req, res) => {
  const { assetId, fromBaseId, toBaseId, quantity } = req.body;

  try {
    const numericAssetId = Number(assetId);
    const numericFromBaseId = Number(fromBaseId);
    const numericToBaseId = Number(toBaseId);
    const numericQty = Number(quantity);

    // Step 1: Find original asset at fromBase
    const originalAsset = await prisma.asset.findUnique({
      where: { id: numericAssetId }
    });

    if (!originalAsset) {
      return res.status(404).json({ error: 'Asset not found at source base' });
    }

    // Step 2: Decrease quantity at fromBase
    await prisma.asset.update({
      where: { id: numericAssetId },
      data: {
        quantity: {
          decrement: numericQty
        }
      }
    });

    // Step 3: Check if same asset exists at toBase
    const existingAtToBase = await prisma.asset.findFirst({
      where: {
        name: originalAsset.name,
        type: originalAsset.type,
        baseId: numericToBaseId
      }
    });

    if (existingAtToBase) {
      // ✅ Step 3A: If it exists, increment its quantity
      await prisma.asset.update({
        where: { id: existingAtToBase.id },
        data: {
          quantity: {
            increment: numericQty
          }
        }
      });
    } else {
      // ❌ Step 3B: If not, create a new asset record at destination base
      await prisma.asset.create({
        data: {
          name: originalAsset.name,
          type: originalAsset.type,
          quantity: numericQty,
          baseId: numericToBaseId,
          purchaseDate: originalAsset.purchaseDate // carry forward purchaseDate
        }
      });
    }

    // Step 4: Record the transfer
    await prisma.transfer.create({
      data: {
        assetId: numericAssetId,
        fromBaseId: numericFromBaseId,
        toBaseId: numericToBaseId,
        quantity: numericQty
      }
    });

    res.json({ message: 'Transfer successful' });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Transfer failed' });
  }
};

// GET /api/transfers
exports.getTransfers = async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        asset: true,
        fromBase: true,
        toBase: true
      }
    });
    res.json(transfers);
  } catch (err) {
    console.error('Error fetching transfers:', err);
    res.status(500).json({ error: 'Failed to get transfers' });
  }
};
