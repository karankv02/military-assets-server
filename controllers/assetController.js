// controllers/assetController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create (Purchase) a new asset
exports.createAsset = async (req, res) => {
  const { name, type, quantity, purchaseDate, baseId } = req.body;

  try {
    const asset = await prisma.asset.create({
      data: {
        name,
        type,
        quantity: Number(quantity),
        purchaseDate: new Date(purchaseDate),
        baseId: Number(baseId),
      },
    });

    res.status(201).json({ message: 'Asset created successfully', asset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating asset' });
  }
};



