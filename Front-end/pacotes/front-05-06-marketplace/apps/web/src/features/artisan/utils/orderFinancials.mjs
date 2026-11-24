
function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getOrderNumbers(order) {
  const rawQuantity = Number(order.quantity);
  const rawUnitPrice = Number(order.unitPrice);
  const quantity = Number.isFinite(rawQuantity) ? Math.max(0, rawQuantity) : 0;
  const unitPrice = Number.isFinite(rawUnitPrice) ? Math.max(0, rawUnitPrice) : 0;
  const gross = roundCurrency(quantity * unitPrice);
  const rawPercentage = Number(order.repassPercentage ?? 85);
  const validPercentage = Number.isFinite(rawPercentage)
    && rawPercentage >= 85
    && rawPercentage <= 100;

  const percentage = validPercentage ? rawPercentage : 85;
  const payout = roundCurrency(gross * (percentage / 100));

  return {
    gross,
    percentage,
    payout,
    difference: roundCurrency(gross - payout),
    validPercentage,
  };
}
