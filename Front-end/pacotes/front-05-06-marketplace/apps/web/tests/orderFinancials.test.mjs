import test from 'node:test';
import assert from 'node:assert/strict';
import { getOrderNumbers } from '../src/features/artisan/utils/orderFinancials.mjs';

test('calcula valor bruto e repasse mínimo de 85%', () => {
  const result = getOrderNumbers({ quantity: 2, unitPrice: 100, repassPercentage: 85 });
  assert.equal(result.gross, 200);
  assert.equal(result.percentage, 85);
  assert.equal(result.payout, 170);
  assert.equal(result.difference, 30);
  assert.equal(result.validPercentage, true);
});

test('aceita percentual acima do mínimo até 100%', () => {
  const result = getOrderNumbers({ quantity: 3, unitPrice: 50, repassPercentage: 90 });
  assert.equal(result.gross, 150);
  assert.equal(result.percentage, 90);
  assert.equal(result.payout, 135);
  assert.equal(result.validPercentage, true);
});

test('sinaliza percentual abaixo de 85% e exibe cálculo pelo piso mínimo', () => {
  const result = getOrderNumbers({ quantity: 1, unitPrice: 100, repassPercentage: 70 });
  assert.equal(result.percentage, 85);
  assert.equal(result.payout, 85);
  assert.equal(result.validPercentage, false);
});

test('não aceita percentuais acima de 100%', () => {
  const result = getOrderNumbers({ quantity: 1, unitPrice: 100, repassPercentage: 120 });
  assert.equal(result.percentage, 85);
  assert.equal(result.validPercentage, false);
});

test('não produz valores negativos com quantidade ou preço negativos', () => {
  const result = getOrderNumbers({ quantity: -2, unitPrice: -50, repassPercentage: 85 });
  assert.equal(result.gross, 0);
  assert.equal(result.payout, 0);
});

test('arredonda o repasse para centavos', () => {
  const result = getOrderNumbers({ quantity: 1, unitPrice: 19.99, repassPercentage: 85 });
  assert.equal(result.payout, 16.99);
  assert.equal(result.difference, 3);
});


test('trata valores não numéricos e infinitos como zero', () => {
  const result = getOrderNumbers({ quantity: Number.POSITIVE_INFINITY, unitPrice: Number.NaN, repassPercentage: 85 });
  assert.equal(result.gross, 0);
  assert.equal(result.payout, 0);
});
