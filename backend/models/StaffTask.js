const mongoose = require('mongoose');

const staffTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
  },
  taskType: {
    type: String,
    enum: [
      'fefo_rotation',       // Rotate stock: oldest to the front
      'clearance_discount',  // Apply discount tag / poster
      'disposal_removal',    // Pull expired item off shelf
      'overstock_check',     // Overstock shelf check
      'routine_shelf_audit'  // Daily shelf count/audit
    ],
    default: 'routine_shelf_audit',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productName: String,
  batchNumber: String,
  shelfLocation: {
    aisle: String,
    rack: String,
    shelf: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  assignedRole: {
    type: String,
    enum: ['staff', 'owner', 'all'],
    default: 'staff',
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  completedByName: String,
  completedAt: Date,
  date: {
    type: String, // YYYY-MM-DD
    default: () => new Date().toISOString().split('T')[0],
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

module.exports = mongoose.model('StaffTask', staffTaskSchema);
