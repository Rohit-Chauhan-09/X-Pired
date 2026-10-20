/**
 * Smart Discount Suggester Engine
 * Recommends optimal clearance discounts based on days remaining to expiry
 */
function calculateSmartDiscount(daysRemaining, originalPrice, costPrice) {
  let discountPercentage = 0;
  let urgency = 'safe';
  let reasoning = 'Product is fresh. No discount needed.';

  if (daysRemaining <= 0) {
    discountPercentage = 0;
    urgency = 'expired';
    reasoning = 'Product has expired. Cannot be sold - recommend immediate secure disposal.';
  } else if (daysRemaining === 1) {
    discountPercentage = 70;
    urgency = 'critical';
    reasoning = 'Expiring tomorrow! Deep clearance discount needed to recover partial cost and avoid complete loss.';
  } else if (daysRemaining === 2) {
    discountPercentage = 60;
    urgency = 'critical';
    reasoning = 'Only 2 days remaining. Strong clearance incentive recommended.';
  } else if (daysRemaining === 3) {
    discountPercentage = 50;
    urgency = 'critical';
    reasoning = '3 days to expiry. Half-price clearance triggers impulse sales.';
  } else if (daysRemaining <= 5) {
    discountPercentage = 35;
    urgency = 'urgent';
    reasoning = 'Within 5 days of expiry. Moderate discount to accelerate movement.';
  } else if (daysRemaining <= 7) {
    discountPercentage = 25;
    urgency = 'urgent';
    reasoning = 'Expiring in 1 week. Early discount attracts conscious bargain shoppers.';
  } else if (daysRemaining <= 15) {
    discountPercentage = 15;
    urgency = 'attention';
    reasoning = 'Attention zone. Gentle promotional discount to prioritize over fresh batches.';
  }

  const discountAmount = Number(((originalPrice * discountPercentage) / 100).toFixed(2));
  const suggestedPrice = Math.max(1, Math.round(originalPrice - discountAmount));
  const lossPreventedIfSold = Math.max(0, suggestedPrice);

  return {
    discountPercentage,
    suggestedPrice,
    discountAmount,
    urgency,
    reasoning,
    lossPreventedIfSold,
  };
}

module.exports = { calculateSmartDiscount };
