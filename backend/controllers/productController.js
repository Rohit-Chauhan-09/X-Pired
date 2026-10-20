const Product = require('../models/Product');
const SaleHistory = require('../models/SaleHistory');
const Disposal = require('../models/Disposal');
const { calculateSmartDiscount } = require('../utils/discountEngine');
const { analyzeOverstockRisk } = require('../utils/overstockEngine');
const { isDemoUser, getScopedUserQuery } = require('../utils/userFilter');

// Helper: Calculate days remaining
const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return 0;
  const now = new Date();
  const diffTime = new Date(expiryDate).setHours(23, 59, 59, 999) - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// @desc    Get all active products with FEFO sorting & zone filtering
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, zone, rack, status = 'active' } = req.query;

    const userScope = getScopedUserQuery(req.user);
    const andClauses = [userScope];

    if (status !== 'all') {
      andClauses.push({ status });
    }

    if (search) {
      andClauses.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { batchNumber: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } },
          { 'shelfLocation.rack': { $regex: search, $options: 'i' } },
          { 'shelfLocation.shelf': { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (category && category !== 'All') {
      andClauses.push({ category });
    }

    if (rack && rack !== 'All') {
      andClauses.push({ 'shelfLocation.rack': rack });
    }

    // FEFO Sort: Expiry date ascending so earliest expiring products come FIRST
    let products = await Product.find({ $and: andClauses }).sort({ expiryDate: 1, name: 1 });

    // Client/Zone Filtering
    if (zone && zone !== 'All') {
      products = products.filter((p) => {
        const days = getDaysRemaining(p.expiryDate);
        if (zone === 'expired') return days <= 0;
        if (zone === 'critical') return days > 0 && days <= 3;
        if (zone === 'urgent') return days > 3 && days <= 7;
        if (zone === 'attention') return days > 7 && days <= 15;
        if (zone === 'safe') return days > 15;
        return true;
      });
    }

    // Enhance each product with overstock analysis and smart discount suggestions
    const enhanced = products.map((prod) => {
      const p = prod.toObject({ virtuals: true });
      const days = getDaysRemaining(p.expiryDate);
      p.smartDiscount = calculateSmartDiscount(days, p.sellingPrice, p.costPrice);
      p.overstockRisk = analyzeOverstockRisk(p);
      return p;
    });

    res.json(enhanced);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const p = product.toObject({ virtuals: true });
    p.smartDiscount = calculateSmartDiscount(p.daysRemaining, p.sellingPrice, p.costPrice);
    p.overstockRisk = analyzeOverstockRisk(p);
    res.json(p);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product (Manual entry or offline sync)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      batchNumber,
      barcode,
      expiryDate,
      manufacturingDate,
      shelfLocation,
      quantity,
      unit,
      costPrice,
      sellingPrice,
      averageDailySales,
      offlineCreated,
    } = req.body;

    const isDemo = isDemoUser(req.user);

    const product = await Product.create({
      name,
      category,
      batchNumber: batchNumber || `BATCH-${Date.now().toString().slice(-4)}`,
      barcode: barcode || '',
      expiryDate,
      manufacturingDate: manufacturingDate || Date.now(),
      shelfLocation: {
        aisle: shelfLocation?.aisle || 'Aisle 1',
        rack: shelfLocation?.rack || 'Rack A',
        shelf: shelfLocation?.shelf || 'Shelf 1',
        positionNotes: shelfLocation?.positionNotes || '',
      },
      quantity: Number(quantity),
      initialQuantity: Number(quantity),
      unit: unit || 'units',
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      currentPrice: Number(sellingPrice),
      averageDailySales: Number(averageDailySales) || 3,
      offlineCreated: !!offlineCreated,
      addedBy: req.user?._id,
      addedByName: req.user?.name || 'Store Staff',
      user: req.user?._id,
      isDemo,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Batch sync offline products (Offline Product Form Submission)
// @route   POST /api/products/sync-offline
const syncOfflineBatch = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No offline products provided' });
    }

    const isDemo = isDemoUser(req.user);
    const inserted = [];
    for (const item of products) {
      const created = await Product.create({
        ...item,
        batchNumber: item.batchNumber || `BATCH-${Date.now().toString().slice(-4)}`,
        offlineCreated: true,
        addedBy: req.user?._id,
        addedByName: req.user?.name || item.addedByName || 'Store Staff (Offline)',
        user: req.user?._id,
        isDemo,
      });
      inserted.push(created);
    }

    res.status(201).json({
      message: `Successfully synchronized ${inserted.length} offline product(s)`,
      count: inserted.length,
      products: inserted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product details
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Apply Smart Clearance Discount
// @route   PATCH /api/products/:id/discount
const applyDiscount = async (req, res) => {
  try {
    const { discountPercentage } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const discount = Number(discountPercentage);
    const newPrice = Math.max(1, Math.round(product.sellingPrice * (1 - discount / 100)));

    product.discountPercentage = discount;
    product.currentPrice = newPrice;
    product.isDiscounted = discount > 0;
    await product.save();

    res.json({
      message: `Discount of ${discount}% applied! New clearance price: ₹${newPrice}`,
      product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Manual update for sold items (Day-end or Month-end update)
// @route   POST /api/products/:id/sold
const markAsSold = async (req, res) => {
  try {
    const { quantitySold, actionSource = 'Manual Day-End Update' } = req.body;
    const qty = Number(quantitySold);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (qty <= 0 || qty > product.quantity) {
      return res.status(400).json({
        message: `Quantity sold must be between 1 and available stock (${product.quantity})`,
      });
    }

    const soldPrice = product.currentPrice || product.sellingPrice;
    const costPrice = product.costPrice;
    
    // Financial loss prevented calculation:
    // Selling this item before it expired prevented a total loss of (costPrice * qty)
    const lossPrevented = costPrice * qty;
    const revenueRecovered = soldPrice * qty;

    const isDemo = isDemoUser(req.user) || !!product.isDemo;

    // Record sale in history
    const saleRecord = await SaleHistory.create({
      product: product._id,
      productName: product.name,
      batchNumber: product.batchNumber,
      category: product.category,
      quantitySold: qty,
      unit: product.unit,
      originalPrice: product.sellingPrice,
      soldPrice,
      costPrice,
      discountPercentage: product.discountPercentage,
      lossPrevented,
      revenueRecovered,
      soldBy: req.user?._id,
      soldByName: req.user?.name || 'Store Staff',
      actionSource,
      user: req.user?._id,
      isDemo,
    });

    // Decrement product quantity
    product.quantity -= qty;
    if (product.quantity === 0) {
      product.status = 'sold';
    }
    await product.save();

    res.json({
      message: `Successfully marked ${qty} ${product.unit} sold! Financial loss prevented: ₹${lossPrevented.toFixed(2)}`,
      product,
      saleRecord,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dispose of expired/damaged item (Secure Disposal History)
// @route   POST /api/products/:id/dispose
const disposeProduct = async (req, res) => {
  try {
    const { quantityDisposed, reason, notes } = req.body;
    const qty = Number(quantityDisposed);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (qty <= 0 || qty > product.quantity) {
      return res.status(400).json({
        message: `Disposal quantity must be between 1 and available stock (${product.quantity})`,
      });
    }

    const costLoss = (product.costPrice || 0) * qty;

    const isDemo = isDemoUser(req.user) || !!product.isDemo;

    // Create permanent Disposal record
    const disposalRecord = await Disposal.create({
      product: product._id,
      productName: product.name,
      batchNumber: product.batchNumber,
      category: product.category,
      quantityDisposed: qty,
      unit: product.unit,
      costLoss,
      shelfLocation: product.shelfLocation,
      reason: reason || 'Expired Before Sale',
      disposedBy: req.user?._id,
      disposedByName: req.user?.name || 'Store Staff',
      notes: notes || '',
      user: req.user?._id,
      isDemo,
    });

    // Update product stock
    product.quantity -= qty;
    if (product.quantity === 0) {
      product.status = 'disposed';
    }
    await product.save();

    res.json({
      message: `Disposal logged successfully. Loss recorded: ₹${costLoss.toFixed(2)}`,
      product,
      disposalRecord,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product completely
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed from system' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get predictive overstock warnings
// @route   GET /api/products/overstock-warnings
const getOverstockWarnings = async (req, res) => {
  try {
    const userScope = getScopedUserQuery(req.user);
    const activeProducts = await Product.find({
      $and: [
        userScope,
        { status: 'active', quantity: { $gt: 0 } },
      ],
    });
    const warnings = [];

    for (const prod of activeProducts) {
      const risk = analyzeOverstockRisk(prod);
      if (risk.isOverstocked) {
        warnings.push({
          product: prod,
          risk,
        });
      }
    }

    // Sort by potential loss descending
    warnings.sort((a, b) => b.risk.potentialLoss - a.risk.potentialLoss);

    res.json(warnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  syncOfflineBatch,
  updateProduct,
  applyDiscount,
  markAsSold,
  disposeProduct,
  deleteProduct,
  getOverstockWarnings,
};
