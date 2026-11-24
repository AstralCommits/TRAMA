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

export function getOrderNumbers(order: OrderFinancialInput): OrderNumbers;
