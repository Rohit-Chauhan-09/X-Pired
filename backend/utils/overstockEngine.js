/**
 * Predictive Overstock Warning Engine
 * Identifies perishable inventory where current quantity exceeds expected sales velocity
 */
function analyzeOverstockRisk(product) {
  const now = new Date();
  const diffTime = new Date(product.expiryDate).setHours(23, 59, 59, 999) - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  const currentQuantity = product.quantity || 0;
  const dailyVelocity = product.averageDailySales || 2; // Default 2 units per day
  const projectedSales = Math.round(dailyVelocity * Math.max(1, daysRemaining));
  
  if (daysRemaining <= 0) {
    return {
      isOverstocked: false,
      riskLevel: 'EXPIRED',
      surplusUnits: currentQuantity,
      potentialLoss: currentQuantity * (product.costPrice || 0),
      recommendation: 'Item has expired. Pull from shelf and log in disposal history.',
    };
  }

  const surplusUnits = currentQuantity - projectedSales;

  if (surplusUnits <= 0) {
    return {
      isOverstocked: false,
      riskLevel: 'OPTIMAL',
      surplusUnits: 0,
      potentialLoss: 0,
      recommendation: 'Stock quantity is well balanced with expected sales rate.',
    };
  }

  const potentialLoss = surplusUnits * (product.costPrice || 0);
  let riskLevel = 'MEDIUM';
  let recommendation = `At average sales of ${dailyVelocity} ${product.unit}/day, ~${projectedSales} units will sell before expiry. ${surplusUnits} surplus units risk expiring. Recommend clearance discount or placement at checkout counter.`;

  if (currentQuantity >= projectedSales * 2) {
    riskLevel = 'CRITICAL_HIGH';
    recommendation = `CRITICAL OVERSTOCK: Current stock (${currentQuantity} ${product.unit}) is more than 2x the projected sales (${projectedSales} ${product.unit}) for the remaining ${daysRemaining} days! Potential loss of ₹${potentialLoss.toFixed(2)}. Apply 50%+ discount or bundle BOGO offer immediately!`;
  }

  return {
    isOverstocked: true,
    riskLevel,
    daysRemaining,
    currentQuantity,
    dailyVelocity,
    projectedSales,
    surplusUnits,
    potentialLoss,
    recommendation,
  };
}

module.exports = { analyzeOverstockRisk };
