const mongoose = require('mongoose');

const saleHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productName: {
    type: String,
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantitySold: {
    type: Number,
    required: true,
    min: 1,
  },
  unit: {
    type: String,
    default: 'units',
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  soldPrice: {
    type: Number,
    required: true,
  },
  costPrice: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  // Financial loss prevented calculation:
  // If product was sold (especially under discount or before expiry),
  // revenue recovered is (soldPrice * quantitySold)
  // and capital loss prevented is (costPrice * quantitySold)
  lossPrevented: {
    type: Number,
    required: true,
  },
  revenueRecovered: {
    type: Number,
    required: true,
  },
  soldAt: {
    type: Date,
    default: Date.now,
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  soldByName: {
    type: String,
    default: 'Store Staff',
  },
  actionSource: {
    type: String,
    enum: ['Manual Day-End Update', 'Month-End Update', 'Clearance Sale', 'Regular Sale'],
    default: 'Manual Day-End Update',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isDemo: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('SaleHistory', saleHistorySchema);
