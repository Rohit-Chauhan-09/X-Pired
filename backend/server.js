const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'X-Pired Backend API',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/staff-tasks', require('./routes/staffTaskRoutes'));
app.use('/api/disposals', require('./routes/disposalRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

// Background Automated Expiry Checker & Email Alert Cron Job
// Runs every morning at 08:00 AM (or can be triggered on-demand)
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ Running automated daily expiry check cron job...');
  try {
    const Product = require('./models/Product');
    const Setting = require('./models/Setting');
    const { sendExpiryAlertEmail } = require('./utils/emailService');

    const settings = await Setting.findOne();
    if (!settings || !settings.enableEmailAlerts) {
      console.log('ℹ️ Email alerts disabled in store settings');
      return;
    }

    const thresholdDays = settings.urgentDaysThreshold || 7;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + thresholdDays);

    const expiringProducts = await Product.find({
      status: 'active',
      quantity: { $gt: 0 },
      expiryDate: { $lte: targetDate },
    }).sort({ expiryDate: 1 });

    if (expiringProducts.length > 0) {
      const totalRisk = expiringProducts.reduce((sum, p) => sum + (p.costPrice || 0) * (p.quantity || 1), 0);
      await sendExpiryAlertEmail({
        toEmail: settings.alertEmail,
        expiringProducts,
        criticalCount: expiringProducts.length,
        totalRiskValue: totalRisk,
      });
      console.log(`📧 Daily automated alert sent for ${expiringProducts.length} items`);
    } else {
      console.log('✨ Daily scan: No critical expiring products today');
    }
  } catch (err) {
    console.error('❌ Daily expiry check cron error:', err.message);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 X-Pired Server running on port ${PORT}`);
  console.log(`👉 API Health: http://localhost:${PORT}/api/health`);
});
