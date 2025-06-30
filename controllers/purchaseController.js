const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPurchase = async (req, res) => {
  const { name, type, quantity, baseId, purchaseDate, cost, supplier } = req.body;

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

    const purchase = await prisma.purchase.create({
      data: {
        assetId: asset.id,
        baseId: Number(baseId),
        quantity: Number(quantity),
        cost: parseFloat(cost),
        supplier,
        purchasedAt: new Date(purchaseDate),
      },
      include: {
        asset: true,
        base: true,
      }
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error("Error creating purchase:", error);
    res.status(400).json({ error: "Failed to create purchase" });
  }
};

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        asset: true,
        base: true
      }
    });
    res.json(purchases);
  } catch (err) {
    console.error("Error fetching purchases:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
};
