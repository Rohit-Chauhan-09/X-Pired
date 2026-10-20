const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Dairy & Eggs',
      'Bakery & Bread',
      'Meat & Poultry',
      'Beverages & Juices',
      'Snacks & Confectionery',
      'Medicines & Health',
      'Canned & Packaged Foods',
      'Fruits & Vegetables',
      'Other',
    ],
    default: 'Other',
  },
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required for FEFO tracking'],
    trim: true,
  },
  barcode: {
    type: String,
    trim: true,
    default: '',
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  manufacturingDate: {
    type: Date,
    default: Date.now,
  },
  shelfLocation: {
    aisle: { type: String, default: 'Aisle 1', trim: true },
    rack: { type: String, required: true, trim: true }, // e.g., 'Rack A', 'Rack B'
    shelf: { type: String, required: true, trim: true }, // e.g., 'Shelf 1', 'Shelf 2'
    positionNotes: { type: String, default: '', trim: true }, // e.g., 'Front left corner'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
  },
  initialQuantity: {
    type: Number,
    default: function() { return this.quantity; }
  },
  unit: {
    type: String,
    default: 'units', // 'units', 'packs', 'kg', 'litres', 'bottles'
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required to track financial loss'],
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0,
  },
  currentPrice: {
    type: Number,
    default: function() { return this.sellingPrice; }
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 95,
  },
  isDiscounted: {
    type: Boolean,
    default: false,
  },
  // Average daily sales velocity to calculate Predictive Overstock Warning
  averageDailySales: {
    type: Number,
    default: 3, // Units typically sold per day
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'disposed', 'archived'],
    default: 'active',
  },
  offlineCreated: {
    type: Boolean,
    default: false,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  addedByName: {
    type: String,
    default: 'Store Staff',
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Days Remaining until Expiry
productSchema.virtual('daysRemaining').get(function () {
  if (!this.expiryDate) return 0;
  const now = new Date();
  const diffTime = new Date(this.expiryDate).setHours(23, 59, 59, 999) - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for Color-Coded Dashboard Zone
// Red (Expired or <= 3 days), Orange (4-7 days), Yellow (8-15 days), Green (> 15 days)
productSchema.virtual('zone').get(function () {
  const days = this.daysRemaining;
  if (days <= 0) return 'expired';
  if (days <= 3) return 'critical'; // Red
  if (days <= 7) return 'urgent';   // Orange
  if (days <= 15) return 'attention'; // Yellow
  return 'safe'; // Green
});

// Virtual for Overstock Risk Check
productSchema.virtual('isOverstocked').get(function () {
  const days = this.daysRemaining;
  if (days <= 0 || this.quantity <= 0) return false;
  // If remaining quantity is higher than projected sales before expiry
  const projectedSales = (this.averageDailySales || 2) * Math.max(1, days);
  return this.quantity > projectedSales;
});

// Index for batch-wise FEFO (First Expire First Out)
productSchema.index({ expiryDate: 1, name: 1, batchNumber: 1 });

module.exports = mongoose.model('Product', productSchema);
