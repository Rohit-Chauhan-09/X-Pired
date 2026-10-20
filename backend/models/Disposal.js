const mongoose = require('mongoose');

const disposalSchema = new mongoose.Schema({
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
  quantityDisposed: {
    type: Number,
    required: true,
    min: 1,
  },
  unit: {
    type: String,
    default: 'units',
  },
  costLoss: {
    type: Number,
    required: true, // Quantity * Cost Price = direct financial loss from expiring
  },
  shelfLocation: {
    aisle: String,
    rack: String,
    shelf: String,
  },
  reason: {
    type: String,
    enum: [
      'Expired Before Sale',
      'Damaged / Spoiled',
      'Packaging Broken',
      'Donated To Food Bank',
      'Returned To Supplier',
      'Bio-Waste Compost',
    ],
    default: 'Expired Before Sale',
  },
  disposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  disposedByName: {
    type: String,
    default: 'Store Staff',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isDemo: {
    type: Boolean,
    default: false,
  },
  disposalCertificateNo: {
    type: String,
    unique: true,
    default: function() {
      return 'DSP-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);
    }
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Disposal', disposalSchema);
