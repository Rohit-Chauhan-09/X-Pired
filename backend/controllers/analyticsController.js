const Product = require('../models/Product');
const SaleHistory = require('../models/SaleHistory');
const Disposal = require('../models/Disposal');
const { getScopedUserQuery } = require('../utils/userFilter');

// Helper: Calculate days remaining
const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return 0;
  const now = new Date();
  const diffTime = new Date(expiryDate).setHours(23, 59, 59, 999) - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// @desc    Get dashboard metrics, color zones, financial loss prevented
// @route   GET /api/analytics/dashboard
const getDashboardSummary = async (req, res) => {
  try {
    const userScope = getScopedUserQuery(req.user);

    const products = await Product.find({
      $and: [
        userScope,
        { status: 'active', quantity: { $gt: 0 } },
      ],
    });
    const disposals = await Disposal.find(userScope);
    const sales = await SaleHistory.find(userScope);

    let criticalCount = 0; // <= 3 days
    let urgentCount = 0;   // 4 - 7 days
    let attentionCount = 0;// 8 - 15 days
    let safeCount = 0;     // > 15 days
    let expiredCount = 0;  // <= 0 days

    let totalInventoryValue = 0;
    let criticalRiskValue = 0;
    let totalItemsCount = 0;

    const categoryMap = {};

    products.forEach((p) => {
      const days = getDaysRemaining(p.expiryDate);
      const itemCostVal = (p.costPrice || 0) * (p.quantity || 0);
      totalInventoryValue += itemCostVal;
      totalItemsCount += (p.quantity || 0);

      // Category breakdown
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { count: 0, items: 0, value: 0 };
      }
      categoryMap[p.category].count += 1;
      categoryMap[p.category].items += p.quantity;
      categoryMap[p.category].value += itemCostVal;

      // Color-Coded Zones
      if (days <= 0) {
        expiredCount += 1;
        criticalRiskValue += itemCostVal;
      } else if (days <= 3) {
        criticalCount += 1;
        criticalRiskValue += itemCostVal;
      } else if (days <= 7) {
        urgentCount += 1;
      } else if (days <= 15) {
        attentionCount += 1;
      } else {
        safeCount += 1;
      }
    });

    // Financial Loss Prevented calculation
    const totalLossPrevented = sales.reduce((acc, curr) => acc + (curr.lossPrevented || 0), 0);
    const totalRevenueRecovered = sales.reduce((acc, curr) => acc + (curr.revenueRecovered || 0), 0);
    const totalDisposalLoss = disposals.reduce((acc, curr) => acc + (curr.costLoss || 0), 0);

    // Recent 5 sales with loss prevented
    const recentPreventedSales = await SaleHistory.find(userScope)
      .sort({ createdAt: -1 })
      .limit(6);

    // Top 5 Critical Items approaching expiry (FEFO)
    const criticalItems = await Product.find({
      $and: [
        userScope,
        { status: 'active', quantity: { $gt: 0 } },
      ],
    })
      .sort({ expiryDate: 1 })
      .limit(8);

    // Sales and savings chart data over last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const daySales = sales.filter(s => s.createdAt && s.createdAt.toISOString().startsWith(dateStr));
      const dayDisposals = disposals.filter(dsp => dsp.createdAt && dsp.createdAt.toISOString().startsWith(dateStr));

      const prevented = daySales.reduce((acc, s) => acc + (s.lossPrevented || 0), 0);
      const lost = dayDisposals.reduce((acc, s) => acc + (s.costLoss || 0), 0);

      last7Days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        lossPrevented: Math.round(prevented),
        lossIncurred: Math.round(lost),
      });
    }

    res.json({
      zones: {
        critical: criticalCount,
        urgent: urgentCount,
        attention: attentionCount,
        safe: safeCount,
        expired: expiredCount,
      },
      financials: {
        totalInventoryValue: Math.round(totalInventoryValue),
        criticalRiskValue: Math.round(criticalRiskValue),
        totalLossPrevented: Math.round(totalLossPrevented),
        totalRevenueRecovered: Math.round(totalRevenueRecovered),
        totalDisposalLoss: Math.round(totalDisposalLoss),
        netSavingsBenefit: Math.round(totalLossPrevented - totalDisposalLoss),
      },
      counts: {
        activeBatches: products.length,
        totalUnits: totalItemsCount,
        totalDisposals: disposals.length,
        totalSalesRecorded: sales.length,
      },
      categoryBreakdown: Object.keys(categoryMap).map(key => ({
        category: key,
        ...categoryMap[key],
      })),
      trendChart: last7Days,
      criticalItems,
      recentPreventedSales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardSummary };
