const mongoose = require('mongoose');

const defaultCategories = [
  { name: 'Dairy & Eggs', color: '#0284c7', warningDays: 3, criticalDays: 1, icon: 'Milk' },
  { name: 'Bakery & Bread', color: '#d97706', warningDays: 2, criticalDays: 1, icon: 'Wheat' },
  { name: 'Meat & Poultry', color: '#dc2626', warningDays: 2, criticalDays: 1, icon: 'Beef' },
  { name: 'Beverages & Juices', color: '#7c3aed', warningDays: 10, criticalDays: 3, icon: 'CupSoda' },
  { name: 'Snacks & Confectionery', color: '#db2777', warningDays: 15, criticalDays: 5, icon: 'Cookie' },
  { name: 'Medicines & Health', color: '#059669', warningDays: 30, criticalDays: 7, icon: 'Pill' },
  { name: 'Canned & Packaged Foods', color: '#0891b2', warningDays: 20, criticalDays: 5, icon: 'Package' },
  { name: 'Fruits & Vegetables', color: '#16a34a', warningDays: 3, criticalDays: 1, icon: 'Apple' },
  { name: 'Other', color: '#64748b', warningDays: 7, criticalDays: 2, icon: 'Boxes' },
];

const settingSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: 'X-Pired Smart Mart',
  },
  alertEmail: {
    type: String,
    default: 'owner@xpiredstore.com',
  },
  enableEmailAlerts: {
    type: Boolean,
    default: true,
  },
  criticalDaysThreshold: {
    type: Number,
    default: 3,
  },
  urgentDaysThreshold: {
    type: Number,
    default: 7,
  },
  attentionDaysThreshold: {
    type: Number,
    default: 15,
  },
  categories: {
    type: [
      {
        name: String,
        color: String,
        warningDays: Number,
        criticalDays: Number,
        icon: String,
      }
    ],
    default: defaultCategories,
  },
  lastEmailAlertSent: {
    type: Date,
  },
  posterFooterNote: {
    type: String,
    default: 'Clearance item – valid while stocks last. No exchange on discounted perishable items.',
  },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
