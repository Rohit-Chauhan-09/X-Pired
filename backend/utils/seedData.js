const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Disposal = require('../models/Disposal');
const SaleHistory = require('../models/SaleHistory');
const Setting = require('../models/Setting');
const StaffTask = require('../models/StaffTask');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/x_pired_db');
    console.log('✅ MongoDB Connected for Seeding');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  await connectDB();

  try {
    console.log('🧹 Clearing old collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Disposal.deleteMany({});
    await SaleHistory.deleteMany({});
    await Setting.deleteMany({});
    await StaffTask.deleteMany({});

    console.log('👤 Creating demo accounts (Rohit Chauhan & Atharva Chavan)...');
    const owner = await User.create({
      name: 'Rohit Chauhan',
      email: 'owner@xpired.com',
      password: 'password123',
      role: 'owner',
      phone: '+91 98765 43210',
      storeName: 'X-Pired Fresh SuperMart',
    });

    const staff = await User.create({
      name: 'Atharva Chavan',
      email: 'staff@xpired.com',
      password: 'password123',
      role: 'staff',
      phone: '+91 98765 43211',
      storeName: 'X-Pired Fresh SuperMart',
    });

    console.log('⚙️ Initializing Settings & Category custom colors...');
    await Setting.create({
      storeName: 'X-Pired Fresh SuperMart',
      alertEmail: 'owner@xpired.com',
      enableEmailAlerts: true,
      criticalDaysThreshold: 3,
      urgentDaysThreshold: 7,
      attentionDaysThreshold: 15,
      categories: [
        { name: 'Dairy & Eggs', color: '#0284c7', warningDays: 3, criticalDays: 1, icon: 'Milk' },
        { name: 'Bakery & Bread', color: '#d97706', warningDays: 2, criticalDays: 1, icon: 'Wheat' },
        { name: 'Meat & Poultry', color: '#dc2626', warningDays: 2, criticalDays: 1, icon: 'Beef' },
        { name: 'Beverages & Juices', color: '#7c3aed', warningDays: 10, criticalDays: 3, icon: 'CupSoda' },
        { name: 'Snacks & Confectionery', color: '#db2777', warningDays: 15, criticalDays: 5, icon: 'Cookie' },
        { name: 'Medicines & Health', color: '#059669', warningDays: 30, criticalDays: 7, icon: 'Pill' },
        { name: 'Canned & Packaged Foods', color: '#0891b2', warningDays: 20, criticalDays: 5, icon: 'Package' },
        { name: 'Fruits & Vegetables', color: '#16a34a', warningDays: 3, criticalDays: 1, icon: 'Apple' },
        { name: 'Other', color: '#64748b', warningDays: 7, criticalDays: 2, icon: 'Boxes' },
      ],
      posterFooterNote: 'Special Clearance Deal – Grab it before time runs out! No returns on perishable items.',
    });

    const now = new Date();
    const daysFromNow = (days) => {
      const d = new Date();
      d.setDate(now.getDate() + days);
      d.setHours(18, 0, 0, 0);
      return d;
    };

    console.log('📦 Seeding Products across all Color-Coded Zones & FEFO Batches...');
    const demoProducts = [
      // CRITICAL ZONE (1-3 days) & EXPIRED
      {
        name: 'Amul Taaza Homogenised Toned Milk',
        category: 'Dairy & Eggs',
        batchNumber: 'B-AML-1029',
        barcode: '8901262010053',
        expiryDate: daysFromNow(1), // Tomorrow!
        manufacturingDate: daysFromNow(-3),
        shelfLocation: { aisle: 'Aisle 1', rack: 'Rack A', shelf: 'Shelf 1', positionNotes: 'Chiller Display Front' },
        quantity: 18,
        unit: 'litres',
        costPrice: 52,
        sellingPrice: 68,
        averageDailySales: 5,
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      {
        name: 'Harvest Gold 100% Atta Whole Wheat Bread',
        category: 'Bakery & Bread',
        batchNumber: 'B-BRD-8821',
        barcode: '8906010030114',
        expiryDate: daysFromNow(2),
        manufacturingDate: daysFromNow(-3),
        shelfLocation: { aisle: 'Aisle 1', rack: 'Rack B', shelf: 'Shelf 2', positionNotes: 'Bakery Stand Top Row' },
        quantity: 14,
        unit: 'packs',
        costPrice: 32,
        sellingPrice: 48,
        averageDailySales: 4,
        isDiscounted: true,
        discountPercentage: 50,
        currentPrice: 24,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      {
        name: 'Fresh Farm Chicken Breast Cutlets',
        category: 'Meat & Poultry',
        batchNumber: 'B-CHK-5501',
        barcode: '8908819200192',
        expiryDate: daysFromNow(1),
        manufacturingDate: daysFromNow(-2),
        shelfLocation: { aisle: 'Aisle 2', rack: 'Rack A', shelf: 'Shelf 3', positionNotes: 'Deep Freezer Cold Tray 2' },
        quantity: 8,
        unit: 'packs',
        costPrice: 180,
        sellingPrice: 260,
        averageDailySales: 3,
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      {
        name: 'Epigamia Greek Yogurt Strawberry 100g',
        category: 'Dairy & Eggs',
        batchNumber: 'B-EPI-4412',
        barcode: '8906077390192',
        expiryDate: daysFromNow(3),
        manufacturingDate: daysFromNow(-12),
        shelfLocation: { aisle: 'Aisle 1', rack: 'Rack A', shelf: 'Shelf 2', positionNotes: 'Yogurt Fridge Mid Tray' },
        quantity: 26, // Overstock warning!
        unit: 'cups',
        costPrice: 42,
        sellingPrice: 60,
        averageDailySales: 3, // 3 * 3 = 9 projected vs 26 stock! High Overstock
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      // URGENT ZONE (4 - 7 days)
      {
        name: 'Real Fruit Power Mixed Fruit Juice 1L',
        category: 'Beverages & Juices',
        batchNumber: 'B-JUC-9903',
        barcode: '8901207010214',
        expiryDate: daysFromNow(5),
        manufacturingDate: daysFromNow(-120),
        shelfLocation: { aisle: 'Aisle 3', rack: 'Rack C', shelf: 'Shelf 1', positionNotes: 'Beverage Wall Bay 3' },
        quantity: 32,
        unit: 'cartons',
        costPrice: 90,
        sellingPrice: 135,
        averageDailySales: 4,
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      {
        name: 'Britannia Good Day Butter Cookies Pack of 4',
        category: 'Snacks & Confectionery',
        batchNumber: 'B-CKI-3309',
        barcode: '8901063142211',
        expiryDate: daysFromNow(6),
        manufacturingDate: daysFromNow(-150),
        shelfLocation: { aisle: 'Aisle 2', rack: 'Rack B', shelf: 'Shelf 3', positionNotes: 'Snack Aisle Center' },
        quantity: 45, // Overstock alert!
        unit: 'packs',
        costPrice: 65,
        sellingPrice: 100,
        averageDailySales: 3,
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      {
        name: 'Mother Dairy Paneer Fresh 200g',
        category: 'Dairy & Eggs',
        batchNumber: 'B-PNR-7721',
        barcode: '8901648001099',
        expiryDate: daysFromNow(4),
        manufacturingDate: daysFromNow(-10),
        shelfLocation: { aisle: 'Aisle 1', rack: 'Rack A', shelf: 'Shelf 3', positionNotes: 'Dairy Refrigerator Bottom' },
        quantity: 12,
        unit: 'packs',
        costPrice: 70,
        sellingPrice: 95,
        averageDailySales: 4,
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      // ATTENTION ZONE (8 - 15 days)
      {
        name: 'Benadryl Cough Formula Syrup 100ml',
        category: 'Medicines & Health',
        batchNumber: 'B-MED-2201',
        barcode: '8901088012001',
        expiryDate: daysFromNow(12),
        manufacturingDate: daysFromNow(-700),
        shelfLocation: { aisle: 'Aisle 4', rack: 'Rack D', shelf: 'Shelf 1', positionNotes: 'Pharmacy / OTC Cabinet' },
        quantity: 15,
        unit: 'bottles',
        costPrice: 85,
        sellingPrice: 130,
        averageDailySales: 1,
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      {
        name: 'Del Monte Sweet Corn Kernel Can 410g',
        category: 'Canned & Packaged Foods',
        batchNumber: 'B-CAN-6610',
        barcode: '8906007281098',
        expiryDate: daysFromNow(14),
        manufacturingDate: daysFromNow(-340),
        shelfLocation: { aisle: 'Aisle 3', rack: 'Rack C', shelf: 'Shelf 4', positionNotes: 'Canned Goods Row 2' },
        quantity: 20,
        unit: 'cans',
        costPrice: 55,
        sellingPrice: 80,
        averageDailySales: 2,
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      // SAFE ZONE (> 15 days)
      {
        name: 'Fortune Sunlite Refined Sunflower Oil 1L',
        category: 'Other',
        batchNumber: 'B-OIL-4001',
        barcode: '8906007289901',
        expiryDate: daysFromNow(90),
        manufacturingDate: daysFromNow(-15),
        shelfLocation: { aisle: 'Aisle 2', rack: 'Rack B', shelf: 'Shelf 4', positionNotes: 'Cooking Oil Bay' },
        quantity: 60,
        unit: 'pouches',
        costPrice: 110,
        sellingPrice: 145,
        averageDailySales: 5,
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      {
        name: 'Tata Salt Vacuum Evaporated Iodised 1kg',
        category: 'Other',
        batchNumber: 'B-SLT-1190',
        barcode: '8901030383022',
        expiryDate: daysFromNow(180),
        manufacturingDate: daysFromNow(-20),
        shelfLocation: { aisle: 'Aisle 2', rack: 'Rack B', shelf: 'Shelf 1', positionNotes: 'Staples Bottom Shelf' },
        quantity: 100,
        unit: 'packs',
        costPrice: 20,
        sellingPrice: 28,
        averageDailySales: 8,
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      },
      // EXPIRED ITEM FOR DEMO PURPOSES
      {
        name: 'Nestle Everyday Dairy Whitener 200g',
        category: 'Dairy & Eggs',
        batchNumber: 'B-NST-0091',
        barcode: '8901058852382',
        expiryDate: daysFromNow(-1), // Expired yesterday
        manufacturingDate: daysFromNow(-180),
        shelfLocation: { aisle: 'Aisle 1', rack: 'Rack A', shelf: 'Shelf 4', positionNotes: 'Back Corner' },
        quantity: 5,
        unit: 'packs',
        costPrice: 80,
        sellingPrice: 115,
        averageDailySales: 2,
        isDiscounted: false,
        addedBy: staff._id,
        addedByName: staff.name,
      }
    ];

    const insertedProducts = await Product.insertMany(demoProducts);

    console.log('💰 Seeding Financial Loss Prevented (SaleHistory) records...');
    const pastSales = [
      {
        product: insertedProducts[0]._id,
        productName: 'Amul Taaza Homogenised Toned Milk',
        batchNumber: 'B-AML-1020',
        category: 'Dairy & Eggs',
        quantitySold: 12,
        unit: 'litres',
        originalPrice: 68,
        soldPrice: 45,
        costPrice: 52,
        discountPercentage: 35,
        lossPrevented: 12 * 52, // Saved ₹624 in cost!
        revenueRecovered: 12 * 45,
        soldBy: staff._id,
        soldByName: staff.name,
        actionSource: 'Clearance Sale',
      },
      {
        product: insertedProducts[1]._id,
        productName: 'Harvest Gold 100% Atta Whole Wheat Bread',
        batchNumber: 'B-BRD-8815',
        category: 'Bakery & Bread',
        quantitySold: 10,
        unit: 'packs',
        originalPrice: 48,
        soldPrice: 24,
        costPrice: 32,
        discountPercentage: 50,
        lossPrevented: 10 * 32, // Saved ₹320 in cost!
        revenueRecovered: 10 * 24,
        soldBy: staff._id,
        soldByName: staff.name,
        actionSource: 'Clearance Sale',
      },
      {
        product: insertedProducts[4]._id,
        productName: 'Real Fruit Power Mixed Fruit Juice 1L',
        batchNumber: 'B-JUC-9900',
        category: 'Beverages & Juices',
        quantitySold: 8,
        unit: 'cartons',
        originalPrice: 135,
        soldPrice: 100,
        costPrice: 90,
        discountPercentage: 25,
        lossPrevented: 8 * 90, // Saved ₹720 in cost!
        revenueRecovered: 8 * 100,
        soldBy: staff._id,
        soldByName: staff.name,
        actionSource: 'Manual Day-End Update',
      },
    ];
    await SaleHistory.insertMany(pastSales);

    console.log('🗑️ Seeding Secure Disposal History audit records...');
    const disposals = [
      {
        product: insertedProducts[insertedProducts.length - 1]._id,
        productName: 'Nestle Everyday Dairy Whitener 200g',
        batchNumber: 'B-NST-0080',
        category: 'Dairy & Eggs',
        quantityDisposed: 4,
        unit: 'packs',
        costLoss: 4 * 80, // ₹320 lost
        shelfLocation: { aisle: 'Aisle 1', rack: 'Rack A', shelf: 'Shelf 4' },
        reason: 'Expired Before Sale',
        disposedBy: staff._id,
        disposedByName: staff.name,
        disposalCertificateNo: 'DSP-261019-742',
        notes: 'Identified past expiry during morning shelf check. Safe disposal confirmed.',
      },
      {
        product: insertedProducts[2]._id,
        productName: 'Fresh Farm Chicken Breast Cutlets',
        batchNumber: 'B-CHK-5490',
        category: 'Meat & Poultry',
        quantityDisposed: 2,
        unit: 'packs',
        costLoss: 2 * 180, // ₹360 lost
        shelfLocation: { aisle: 'Aisle 2', rack: 'Rack A', shelf: 'Shelf 3' },
        reason: 'Packaging Broken',
        disposedBy: staff._id,
        disposedByName: staff.name,
        disposalCertificateNo: 'DSP-261018-319',
        notes: 'Vacuum seal breached during customer handling. Discarded per hygiene safety SOP.',
      },
    ];
    await Disposal.insertMany(disposals);

    console.log('✅ SEEDING COMPLETE!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Store Owner: owner@xpired.com  / password123');
    console.log('Store Staff: staff@xpired.com  / password123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
