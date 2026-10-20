const Setting = require('../models/Setting');
const Product = require('../models/Product');
const { sendExpiryAlertEmail } = require('../utils/emailService');
const { getScopedUserQuery } = require('../utils/userFilter');

// @desc    Get store settings and category colors
// @route   GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update store settings and category configurations
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Manually trigger email scan & send alert
// @route   POST /api/settings/trigger-email
const triggerEmailScan = async (req, res) => {
  try {
    const settings = await Setting.findOne() || {};
    const thresholdDays = settings.urgentDaysThreshold || 7;

    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + thresholdDays);

    const userScope = getScopedUserQuery(req.user);

    // Find products expiring within threshold or already expired
    const expiringProducts = await Product.find({
      $and: [
        userScope,
        {
          status: 'active',
          quantity: { $gt: 0 },
          expiryDate: { $lte: thresholdDate },
        },
      ],
    }).sort({ expiryDate: 1 });

    if (expiringProducts.length === 0) {
      return res.json({
        success: true,
        message: 'Scan completed. No products currently in urgent expiry danger!',
        expiringCount: 0,
      });
    }

    const totalRiskValue = expiringProducts.reduce(
      (sum, p) => sum + (p.costPrice || 0) * (p.quantity || 1),
      0
    );

    const recipientEmail = req.body.toEmail || settings.alertEmail || process.env.ALERT_EMAIL_TO || 'chmcs2026.rohit@gmail.com';

    const emailResult = await sendExpiryAlertEmail({
      toEmail: recipientEmail,
      expiringProducts,
      criticalCount: expiringProducts.length,
      totalRiskValue,
    });

    res.json({
      success: emailResult.success,
      message: emailResult.success
        ? `Alert email sent successfully to ${settings.alertEmail || 'store owner'} with ${expiringProducts.length} at-risk items!`
        : `Email delivery failed: ${emailResult.error}`,
      previewUrl: emailResult.previewUrl,
      itemsFound: expiringProducts.length,
      totalRiskValue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings, triggerEmailScan };
