
const CNPJ_LENGTH = 14;
const CNPJ_BODY_LENGTH = 12;
const CNPJ_PATTERN = /^[A-Z0-9]{12}[0-9]{2}$/;

export function normalizeCnpj(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CNPJ_LENGTH);
}

export function formatCnpj(value: string): string {
  const normalized = normalizeCnpj(value);
  if (!normalized) return '';

  const parts = [
    normalized.slice(0, 2),
    normalized.slice(2, 5),
    normalized.slice(5, 8),
    normalized.slice(8, 12),
    normalized.slice(12, 14),
  ];

  let formatted = parts[0];
  if (normalized.length > 2) formatted += `.${parts[1]}`;
  if (normalized.length > 5) formatted += `.${parts[2]}`;
  if (normalized.length > 8) formatted += `/${parts[3]}`;
  if (normalized.length > 12) formatted += `-${parts[4]}`;
  return formatted;
}

function characterValue(character: string): number {

  return character.charCodeAt(0) - 48;
}

function calculateCheckDigit(base: string): number {
  let sum = 0;
  let weight = 2;

  for (let index = base.length - 1; index >= 0; index -= 1) {
    sum += characterValue(base[index]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeCnpj(value);

  if (cnpj.length !== CNPJ_LENGTH || !CNPJ_PATTERN.test(cnpj)) return false;

  const body = cnpj.slice(0, CNPJ_BODY_LENGTH);

  if (/^(.)\1{11}$/.test(body)) return false;

  const firstDigit = calculateCheckDigit(body);
  const secondDigit = calculateCheckDigit(`${body}${firstDigit}`);
  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
}
