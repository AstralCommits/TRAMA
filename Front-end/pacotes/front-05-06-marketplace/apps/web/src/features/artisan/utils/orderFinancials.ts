export type OrderFinancialInput = {
  quantity: number;
  unitPrice: number;
  repassPercentage?: number;
};

export type OrderNumbers = {
  gross: number;
  percentage: number;
  payout: number;
  difference: number;
  validPercentage: boolean;
};

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getOrderNumbers(order: OrderFinancialInput): OrderNumbers {
  const quantity = Math.max(0, Number(order.quantity) || 0);
  const unitPrice = Math.max(0, Number(order.unitPrice) || 0);
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
